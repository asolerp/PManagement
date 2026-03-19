/**
 * Llama al LLM (OpenAI) con contexto y mensaje del usuario.
 * Soporta modo simple (solo contexto) y modo con tools (el modelo puede llamar funciones).
 */

const OPENAI_API = 'https://api.openai.com/v1/chat/completions';

const SYSTEM_WITH_TOOLS = `Eres un asistente del panel de administración de PortManagement (gestión de propiedades, cuadrantes, incidencias y revisiones).
Tienes herramientas para: consultar incidencias, cuadrante, trabajos, propiedades, trabajadores, checklists; y para crear una incidencia (createIncidence). Para crear una incidencia: el usuario suele dar el nombre de la propiedad (propertyName), no el ID. Llama createIncidence con title y propertyName; si la herramienta devuelve varias opciones numeradas (1, 2, …), pide al usuario que confirme con el número o el ID y luego llama createIncidence de nuevo con ese propertyId y el mismo título/descripción.
Usa las herramientas cuando necesites datos concretos. Responde en español, breve y claro. Solo usa la información que obtengas de las herramientas; si no tienes datos, dilo. No inventes nada.
Formato para Telegram: evita Markdown (no uses **texto**). Si necesitas resaltar, usa texto claro, listas con viñetas y numeración simple.`;

const MAX_TOOL_ROUNDS = 5;

async function ask(apiKey, systemContext, userMessage) {
  const system = `Eres un asistente del panel de administración de PortManagement.
Responde en español, breve y claro. Solo usa la información del contexto. No inventes datos.

Contexto:
${systemContext}`;

  const res = await fetch(OPENAI_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 500,
      temperature: 0.3
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error: ${res.status} ${err}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error('Empty response from OpenAI');
  return content;
}

async function askWithTools(
  apiKey,
  userMessage,
  openAITools,
  runToolFn,
  systemContext = '',
  conversationHistory = []
) {
  const systemContent =
    SYSTEM_WITH_TOOLS +
    (systemContext
      ? `\n\nContexto operativo del día (usa esto para responder preguntas como "¿qué hay hoy?", "resumen del día", etc.):\n${systemContext}`
      : '');
  const historyMessages = (conversationHistory || [])
    .filter(m => m && m.role && m.content)
    .slice(-10)
    .map(m => ({ role: m.role, content: m.content }));
  const messages = [
    { role: 'system', content: systemContent },
    ...historyMessages,
    { role: 'user', content: userMessage }
  ];

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const res = await fetch(OPENAI_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        tools: openAITools.length ? openAITools : undefined,
        tool_choice: openAITools.length ? 'auto' : undefined,
        max_tokens: 600,
        temperature: 0.3
      })
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI error: ${res.status} ${err}`);
    }

    const data = await res.json();
    const msg = data.choices?.[0]?.message;
    if (!msg) throw new Error('Empty response from OpenAI');

    messages.push({
      role: 'assistant',
      content: msg.content ?? null,
      tool_calls: msg.tool_calls || undefined
    });

    if (!msg.tool_calls || msg.tool_calls.length === 0) {
      const text = (msg.content || '').trim();
      if (text) return text;
      throw new Error('Empty final response from OpenAI');
    }

    for (const tc of msg.tool_calls) {
      if (tc.function?.name === undefined) continue;
      let args = {};
      try {
        if (tc.function.arguments) args = JSON.parse(tc.function.arguments);
      } catch (_) {}
      const result = await runToolFn(tc.function.name, args);
      messages.push({
        role: 'tool',
        tool_call_id: tc.id,
        content: String(result)
      });
    }
  }

  throw new Error('Too many tool rounds');
}

async function naturalReply(apiKey, situation) {
  const res = await fetch(OPENAI_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Eres el asistente de PortManagement en Telegram. Responde de forma natural, breve y amigable en español. ' +
            'Usa formato Telegram (HTML: <b>, <i>, <code>). No uses Markdown. Sé conciso (1-3 frases).'
        },
        {
          role: 'user',
          content: `Situación: ${situation}\n\nGenera una respuesta natural para el usuario.`
        }
      ],
      max_tokens: 200,
      temperature: 0.7
    })
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || null;
}

module.exports = {
  ask,
  askWithTools,
  naturalReply
};
