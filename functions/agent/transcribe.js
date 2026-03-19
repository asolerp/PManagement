/**
 * Transcripción de audio con OpenAI Whisper.
 * Acepta Buffer (ej. nota de voz Telegram en OGG).
 */

const WHISPER_API = 'https://api.openai.com/v1/audio/transcriptions';

async function transcribe(apiKey, audioBuffer, filename = 'voice.ogg') {
  const formData = new FormData();
  formData.append(
    'file',
    new Blob([audioBuffer], { type: 'audio/ogg' }),
    filename
  );
  formData.append('model', 'whisper-1');
  formData.append('language', 'es');

  const res = await fetch(WHISPER_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`
    },
    body: formData
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Whisper error: ${res.status} ${err}`);
  }

  const data = await res.json();
  const text = data?.text?.trim();
  return text || '(sin texto reconocido)';
}

module.exports = {
  transcribe
};
