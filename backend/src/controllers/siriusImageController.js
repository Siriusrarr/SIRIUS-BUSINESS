import { HttpError } from '../utils/httpError.js';

export async function createSiriusImage(req, res) {
  const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';
  if (!prompt || prompt.length > 2000) throw new HttpError(400, 'Describe la imagen en un máximo de 2.000 caracteres.', 'INVALID_PROMPT');
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) throw new HttpError(503, 'Falta configurar GEMINI_API_KEY en el servidor.', 'IMAGE_KEY_MISSING');
  const model = process.env.GEMINI_IMAGE_MODEL?.trim() || 'gemini-3.1-flash-image';
  let response, data;
  try {
    response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { responseModalities: ['IMAGE'] } }),
      signal: AbortSignal.timeout(120000),
    });
    data = await response.json();
  } catch {
    throw new HttpError(502, 'Gemini no respondió. Vuelve a intentarlo en un momento.', 'IMAGE_CONNECTION');
  }
  if (!response.ok) {
    if (response.status === 429) throw new HttpError(429, 'Gemini alcanzó la cuota disponible. Revisa los límites y la facturación del proyecto.', 'IMAGE_QUOTA');
    if ([400, 401, 403, 404].includes(response.status)) throw new HttpError(502, 'Gemini rechazó la solicitud. Comprueba la clave, la facturación y el acceso al modelo de imágenes.', 'IMAGE_CONFIG');
    throw new HttpError(502, 'Gemini no pudo generar la imagen. Inténtalo más tarde.', 'IMAGE_PROVIDER');
  }
  const parts = data.candidates?.[0]?.content?.parts || [];
  const image = parts.find(part => !part.thought && part.inlineData?.data && ['image/png','image/jpeg','image/webp'].includes(part.inlineData.mimeType))?.inlineData;
  if (!image) throw new HttpError(422, 'Gemini no devolvió una imagen. Prueba con otra descripción.', 'IMAGE_EMPTY');
  res.set('Cache-Control', 'no-store').json({ mimeType: image.mimeType, data: image.data });
}
