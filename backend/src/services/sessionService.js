import { settings } from '../config/settings.js';
import { prisma } from '../config/prisma.js';
import { createRawToken, hashToken } from '../utils/tokens.js';

function cookieOptions() {
  return {
    httpOnly: true,
    secure: settings.nodeEnv === 'production' || settings.cookieSameSite === 'none',
    sameSite: settings.cookieSameSite,
    path: '/',
    maxAge: settings.sessionDurationDays * 24 * 60 * 60 * 1000,
  };
}

export async function createSession(userId, response) {
  const rawToken = createRawToken();
  const expiresAt = new Date(Date.now() + settings.sessionDurationDays * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: { userId, tokenHash: hashToken(rawToken), expiresAt },
  });

  response.cookie(settings.cookieName, rawToken, cookieOptions());
}

export function clearSessionCookie(response) {
  response.clearCookie(settings.cookieName, {
    httpOnly: true,
    secure: settings.nodeEnv === 'production' || settings.cookieSameSite === 'none',
    sameSite: settings.cookieSameSite,
    path: '/',
  });
}

export async function revokeSession(rawToken) {
  if (!rawToken) return;
  await prisma.session.deleteMany({ where: { tokenHash: hashToken(rawToken) } });
}
