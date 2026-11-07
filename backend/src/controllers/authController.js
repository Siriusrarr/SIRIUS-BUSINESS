import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { settings } from '../config/settings.js';
import { sendPasswordResetEmail, sendVerificationEmail } from '../services/emailService.js';
import { clearSessionCookie, createSession, revokeSession } from '../services/sessionService.js';
import { createRawToken, hashToken } from '../utils/tokens.js';
import { HttpError } from '../utils/httpError.js';
import {
  emailSchema,
  loginSchema,
  readBody,
  registerSchema,
  resetPasswordSchema,
  tokenSchema,
} from '../utils/validation.js';

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  emailVerified: Boolean(user.emailVerifiedAt),
  selectedPlan: user.selectedPlan ?? null,
  planSelectedAt: user.planSelectedAt ?? null,
  createdAt: user.createdAt,
});

export async function register(req, res) {
  const data = readBody(registerSchema, req.body);
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new HttpError(409, 'Ya existe una cuenta con ese correo electrónico.', 'EMAIL_ALREADY_REGISTERED');
  }

  const passwordHash = await bcrypt.hash(data.password, 12);
  // Modo demostración: no se envían correos. La cuenta queda activa al registrarse.
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      emailVerifiedAt: new Date(),
    },
  });

  await createSession(user.id, res);
  return res.status(201).json({
    message: 'Cuenta creada correctamente. Ya puedes comenzar a usar Sirius Business.',
    user: publicUser(user),
  });
}

export async function login(req, res) {
  const data = readBody(loginSchema, req.body);
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  const passwordMatches = user ? await bcrypt.compare(data.password, user.passwordHash) : false;

  if (!user || !passwordMatches) {
    throw new HttpError(401, 'El correo o la contraseña no son correctos.', 'INVALID_CREDENTIALS');
  }

  await prisma.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  await createSession(user.id, res);
  return res.json({ user: publicUser(user) });
}

export async function logout(req, res) {
  const rawToken = req.cookies?.[settings.cookieName];
  await revokeSession(rawToken);
  clearSessionCookie(res);
  return res.json({ message: 'Has cerrado sesión correctamente.' });
}

export async function me(req, res) {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) throw new HttpError(401, 'La cuenta ya no está disponible.', 'UNAUTHENTICATED');
  return res.json({ user: publicUser(user) });
}

export async function verifyEmail(req, res) {
  const { token } = readBody(tokenSchema, req.body);
  const verification = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });

  if (!verification || verification.expiresAt <= new Date()) {
    if (verification) await prisma.emailVerificationToken.delete({ where: { id: verification.id } });
    throw new HttpError(400, 'El enlace ha caducado o ya se ha utilizado. Solicita uno nuevo.', 'INVALID_OR_EXPIRED_TOKEN');
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: verification.userId },
      data: { emailVerifiedAt: new Date() },
    }),
    prisma.emailVerificationToken.deleteMany({ where: { userId: verification.userId } }),
  ]);

  return res.json({ message: 'Correo verificado. Ya puedes iniciar sesión.' });
}

export async function resendVerification(req, res) {
  const { email } = readBody(emailSchema, req.body);
  const user = await prisma.user.findUnique({ where: { email } });

  // Respuesta idéntica para cuentas inexistentes o ya verificadas para no revelar usuarios registrados.
  if (!user || user.emailVerifiedAt) {
    return res.json({ message: 'Si existe una cuenta pendiente de verificar con ese correo, recibirás un nuevo enlace.' });
  }

  const rawToken = createRawToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await prisma.$transaction([
    prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } }),
    prisma.emailVerificationToken.create({
      data: { userId: user.id, tokenHash: hashToken(rawToken), expiresAt },
    }),
  ]);

  try {
    await sendVerificationEmail(user, rawToken);
  } catch (error) {
    console.error('No se pudo reenviar el correo de verificación:', error.message);
    throw new HttpError(503, 'El servicio de correo no está disponible. Inténtalo más tarde.', 'EMAIL_SEND_FAILED');
  }

  return res.json({ message: 'Si existe una cuenta pendiente de verificar con ese correo, recibirás un nuevo enlace.' });
}

export async function forgotPassword(req, res) {
  const { email } = readBody(emailSchema, req.body);
  const user = await prisma.user.findUnique({ where: { email } });

  // No confirmar si el correo está registrado.
  if (!user || !user.emailVerifiedAt) {
    return res.json({ message: 'Si el correo pertenece a una cuenta, recibirás instrucciones para recuperar el acceso.' });
  }

  const rawToken = createRawToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
    prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash: hashToken(rawToken), expiresAt },
    }),
  ]);

  try {
    await sendPasswordResetEmail(user, rawToken);
  } catch (error) {
    console.error('No se pudo enviar el correo de recuperación:', error.message);
    throw new HttpError(503, 'El servicio de correo no está disponible. Inténtalo más tarde.', 'EMAIL_SEND_FAILED');
  }

  return res.json({ message: 'Si el correo pertenece a una cuenta, recibirás instrucciones para recuperar el acceso.' });
}

export async function resetPassword(req, res) {
  const data = readBody(resetPasswordSchema, req.body);
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(data.token) },
  });

  if (!resetToken || resetToken.expiresAt <= new Date()) {
    if (resetToken) await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
    throw new HttpError(400, 'El enlace ha caducado o ya se ha utilizado. Solicita recuperar tu contraseña otra vez.', 'INVALID_OR_EXPIRED_TOKEN');
  }

  const passwordHash = await bcrypt.hash(data.password, 12);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    // Obliga a todos los dispositivos a iniciar sesión otra vez.
    prisma.session.deleteMany({ where: { userId: resetToken.userId } }),
    prisma.passwordResetToken.deleteMany({ where: { userId: resetToken.userId } }),
  ]);

  clearSessionCookie(res);
  return res.json({ message: 'Contraseña actualizada. Ya puedes iniciar sesión con la nueva contraseña.' });
}


const availablePlans = new Set(['free', 'entrepreneur', 'business_pro']);

export async function selectPlan(req, res) {
  const plan = typeof req.body?.plan === 'string' ? req.body.plan : '';
  if (!availablePlans.has(plan)) {
    throw new HttpError(400, 'Selecciona uno de los planes disponibles.', 'INVALID_PLAN');
  }

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { selectedPlan: plan, planSelectedAt: new Date() },
  });

  return res.json({
    message: 'Tu plan de demostración se ha guardado correctamente.',
    user: publicUser(user),
    billing: { mode: 'demo', charged: false },
  });
}
