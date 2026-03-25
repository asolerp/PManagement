/**
 * Resumen diario por Telegram.
 *
 * - scheduledDailySummary: cron L-S a las 9:00 Europe/Madrid
 * - sendDailySummaryNow:   endpoint HTTP para lanzar manualmente
 *     POST https://<region>-<project>.cloudfunctions.net/sendDailySummaryNow
 *     Header: x-summary-key: <DAILY_SUMMARY_SECRET>
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { sendMessage } = require('./telegramApi');
const {
  telegramBotToken,
  grafanaLokiUrl,
  grafanaLokiUser,
  grafanaLokiToken
} = require('./config');
const { logEvent } = require('../lib/obsLogger');
const { defineSecret } = require('firebase-functions/params');
const { REGION } = require('../utils');

const dailySummarySecret = defineSecret('DAILY_SUMMARY_SECRET');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDate(value) {
  if (!value) return null;
  if (value?.toDate && typeof value.toDate === 'function')
    return value.toDate();
  if (typeof value?.seconds === 'number') return new Date(value.seconds * 1000);
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function ymd(value) {
  const d = toDate(value);
  return d ? d.toISOString().slice(0, 10) : null;
}

function fmtDate(value) {
  const d = toDate(value);
  if (!d) return '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm} ${hh}:${mi}`;
}

function escapeHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function buildDailySummaryHtml(db, today) {
  const [incSnap, jobsSnap, clSnap] = await Promise.all([
    db.collection('incidences').get(),
    db.collection('jobs').get(),
    db.collection('checklists').get()
  ]);

  const incidents = incSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const jobs = jobsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const checklists = clSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const now = new Date();
  const dueThreshold = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const openInc = incidents.filter(i => !i.done);
  const criticalInc = openInc.filter(
    i => i.priority === 'critical' || i.priority === 'high'
  );
  const overdueInc = openInc.filter(i => {
    const due = toDate(i.responseDueAt || i.resolutionDueAt);
    return due && due < now;
  });
  const dueSoonInc = openInc.filter(i => {
    const due = toDate(i.responseDueAt || i.resolutionDueAt);
    return due && due > now && due <= dueThreshold;
  });

  const jobsToday = jobs
    .filter(j => ymd(j.date) === today)
    .filter(j => !(j.done || j.status === 'done' || j.status === 'cancelled'));
  const jobsOverdue = jobs.filter(j => {
    const d = ymd(j.date);
    return (
      d &&
      d < today &&
      !(j.done || j.status === 'done' || j.status === 'cancelled')
    );
  });

  const openCl = checklists.filter(c => !c.finished);
  const clToday = openCl.filter(c => ymd(c.date) === today);

  const lines = [];
  lines.push(`📊 <b>Resumen diario — ${today}</b>`);
  lines.push('━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('');

  lines.push(`⚠️ <b>Incidencias abiertas: ${openInc.length}</b>`);
  if (criticalInc.length > 0) {
    lines.push(
      `   🔴 ${criticalInc.length} crítica${criticalInc.length !== 1 ? 's' : ''}/alta${criticalInc.length !== 1 ? 's' : ''}`
    );
  }
  if (overdueInc.length > 0) {
    lines.push(`   ⏰ ${overdueInc.length} fuera de plazo`);
    overdueInc.slice(0, 3).forEach(i => {
      lines.push(
        `   • ${escapeHtml(i.title || '(sin título)')} — vencía ${fmtDate(i.responseDueAt || i.resolutionDueAt)}`
      );
    });
    if (overdueInc.length > 3)
      lines.push(`   … y ${overdueInc.length - 3} más`);
  }
  if (dueSoonInc.length > 0) {
    lines.push(
      `   🕐 ${dueSoonInc.length} vence${dueSoonInc.length !== 1 ? 'n' : ''} en las próximas 24h`
    );
  }
  lines.push('');

  lines.push(`🔧 <b>Trabajos de hoy: ${jobsToday.length}</b>`);
  if (jobsToday.length > 0) {
    jobsToday.slice(0, 5).forEach(j => {
      const name = j.title || j.jobName || '(sin nombre)';
      const house = j.house?.houseName || j.house?.[0]?.houseName || '';
      lines.push(
        `   • ${escapeHtml(name)}${house ? ` — ${escapeHtml(house)}` : ''}`
      );
    });
    if (jobsToday.length > 5) lines.push(`   … y ${jobsToday.length - 5} más`);
  }
  if (jobsOverdue.length > 0) {
    lines.push(
      `   ⏰ ${jobsOverdue.length} trabajo${jobsOverdue.length !== 1 ? 's' : ''} atrasado${jobsOverdue.length !== 1 ? 's' : ''}`
    );
  }
  lines.push('');

  lines.push(`📋 <b>Checklists hoy: ${clToday.length}</b>`);
  if (openCl.length > clToday.length) {
    lines.push(
      `   ${openCl.length - clToday.length} revisión${openCl.length - clToday.length !== 1 ? 'es' : ''} pendiente${openCl.length - clToday.length !== 1 ? 's' : ''} de otros días`
    );
  }
  lines.push('');

  if (openInc.length === 0 && jobsToday.length === 0 && openCl.length === 0) {
    lines.push('✅ Todo al día. ¡Buen trabajo!');
  } else {
    lines.push(
      '<i>Escríbeme si necesitas más detalle sobre alguna sección.</i>'
    );
  }

  return lines.join('\n');
}

async function runDailySummary(botToken) {
  const db = admin.firestore();
  const today = new Date().toISOString().slice(0, 10);

  const usersSnap = await db
    .collection('users')
    .where('telegramId', '!=', '')
    .get();

  const telegramUsers = usersSnap.docs
    .map(d => ({
      uid: d.id,
      telegramId: d.data().telegramId,
      name:
        [d.data().firstName, d.data().lastName].filter(Boolean).join(' ') ||
        d.data().name ||
        'Usuario'
    }))
    .filter(u => u.telegramId);

  if (telegramUsers.length === 0) {
    logEvent('info', 'daily_summary', 'no_users', { today });
    return { sent: 0, failed: 0, total: 0 };
  }

  logEvent('info', 'daily_summary', 'start', {
    today,
    total: telegramUsers.length
  });

  const message = await buildDailySummaryHtml(db, today);

  let sent = 0;
  let failed = 0;
  for (const user of telegramUsers) {
    try {
      await sendMessage(botToken, user.telegramId, message);
      sent++;
    } catch (err) {
      failed++;
      logEvent('warn', 'daily_summary', 'send_failed', {
        userId: user.uid,
        userName: user.name,
        error: err.message
      });
    }
  }

  logEvent('info', 'daily_summary', 'done', {
    today,
    sent,
    failed,
    total: telegramUsers.length
  });
  return { sent, failed, total: telegramUsers.length };
}

// ─── Cron L-S 9:00 Europe/Madrid ──────────────────────────────────────────────

exports.scheduledDailySummary = functions
  .region(REGION)
  .runWith({
    timeoutSeconds: 120,
    memory: '256MB',
    secrets: [
      telegramBotToken,
      grafanaLokiUrl,
      grafanaLokiUser,
      grafanaLokiToken
    ]
  })
  .pubsub.schedule('0 9 * * 1-6')
  .timeZone('Europe/Madrid')
  .onRun(async () => {
    const botToken = telegramBotToken.value();
    if (!botToken) {
      console.error('[DAILY_SUMMARY] No TELEGRAM_BOT_TOKEN configured');
      return null;
    }
    return runDailySummary(botToken);
  });

// ─── HTTP manual trigger ───────────────────────────────────────────────────────
// POST https://europe-west1-port-management-9bd53.cloudfunctions.net/sendDailySummaryNow
// Header: x-summary-key: <DAILY_SUMMARY_SECRET>

exports.sendDailySummaryNow = functions
  .region(REGION)
  .runWith({
    timeoutSeconds: 120,
    memory: '256MB',
    secrets: [
      telegramBotToken,
      dailySummarySecret,
      grafanaLokiUrl,
      grafanaLokiUser,
      grafanaLokiToken
    ]
  })
  .https.onRequest(async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    const secret = (dailySummarySecret.value() || '').trim();
    const provided = (req.headers['x-summary-key'] || '').trim();
    if (!secret || !provided || provided !== secret) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const botToken = telegramBotToken.value();
    if (!botToken) {
      res.status(500).json({ error: 'TELEGRAM_BOT_TOKEN not configured' });
      return;
    }

    try {
      const result = await runDailySummary(botToken);
      res.status(200).json({ ok: true, ...result });
    } catch (err) {
      console.error('[DAILY_SUMMARY] Manual trigger error:', err);
      res.status(500).json({ ok: false, error: err.message });
    }
  });
