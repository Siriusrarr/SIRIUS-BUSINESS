import { z } from 'zod';
import { HttpError } from './httpError.js';

const email = z.string().trim().email('Introduce un correo electrónico válido.').max(254)
  .transform((value) => value.toLowerCase());
const password = z.string()
  .min(10, 'La contraseña debe tener al menos 10 caracteres.')
  .max(72, 'La contraseña no puede superar los 72 caracteres.')
  .refine((value) => Buffer.byteLength(value, 'utf8') <= 72, 'La contraseña es demasiado larga.');

const personName = z.string().trim().min(2, 'Escribe un nombre válido.').max(80).regex(/^[\p{L}\p{M}][\p{L}\p{M}\s.'’-]*$/u, 'El nombre no debe contener números ni símbolos no válidos.');

export const registerSchema = z.object({
  name: personName,
  email,
  password,
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1).max(72)
    .refine((value) => Buffer.byteLength(value, 'utf8') <= 72, 'La contraseña es demasiado larga.'),
});
export const emailSchema = z.object({ email });
export const tokenSchema = z.object({ token: z.string().regex(/^[a-f0-9]{64}$/i, 'El enlace no es válido.') });
export const resetPasswordSchema = z.object({
  token: z.string().regex(/^[a-f0-9]{64}$/i, 'El enlace no es válido.'),
  password,
});

export function readBody(schema, body) {
  const result = schema.safeParse(body);
  if (!result.success) {
    const message = result.error.issues?.[0]?.message || 'Revisa los datos del formulario.';
    throw new HttpError(400, message, 'VALIDATION_ERROR');
  }
  return result.data;
}
