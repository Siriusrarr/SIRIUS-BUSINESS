import { HttpError } from '../utils/httpError.js';

export async function createSiriusImage(req, res) {
  const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';
  if (!prompt || prompt.length > 2000) throw new HttpError(400, 'Describe la imagen en un máximo de 2.000 caracteres.', 'INVALID_PROMPT');
  const token = process.env.WORKERS_API_KEY?.trim() || process.env.CLOUDFLARE_API_TOKEN?.trim();
  const account = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
  if (!token || !account) throw new HttpError(503, 'Configura WORKERS_API_KEY y CLOUDFLARE_ACCOUNT_ID en Render.', 'IMAGE_CONFIG');
  const endpoint = 'https://api.cloudflare.com/client/v4/accounts/' + encodeURIComponent(account) + '/ai/run/@cf/black-forest-labs/flux-1-schnell';
  let response, data;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, steps: 4 }),
      signal: AbortSignal.timeout(120000),
    });
    if (response.ok) data = await response.json();
  } catch {
    throw new HttpError(502, 'Cloudflare no pudo completar la solicitud. Inténtalo de nuevo.', 'IMAGE_CONNECTION');
  }
  if (response.status === 429) throw new HttpError(429, 'Se alcanzó el límite de Workers AI. Revisa la cuota en Cloudflare.', 'IMAGE_QUOTA');
  if ([401,403,404].includes(response.status)) throw new HttpError(502, 'Revisa el token, la cuenta y los permisos de Workers AI.', 'IMAGE_CONFIG');
  const image = data?.result?.image;
  if (!response.ok || typeof image !== 'string' || !image) throw new HttpError(502, 'Cloudflare no devolvió una imagen. Prueba de nuevo.', 'IMAGE_PROVIDER');
  const mimeType = image.startsWith('iVBOR') ? 'image/png' : 'image/jpeg';
  res.set('Cache-Control', 'no-store').json({ mimeType, data: image });
}
