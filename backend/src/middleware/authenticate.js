import { prisma } from '../config/prisma.js';
import { settings } from '../config/settings.js';
import { hashToken } from '../utils/tokens.js';
import { HttpError } from '../utils/httpError.js';

export async function authenticate(req, res, next) {
  try {
    const rawToken = req.cookies?.[settings.cookieName];
    if (!rawToken) throw new HttpError(401, 'Inicia sesión para continuar.', 'UNAUTHENTICATED');

    const session = await prisma.session.findUnique({
      where: { tokenHash: hashToken(rawToken) },
      include: { user: true },
    });

    if (!session || session.expiresAt <= new Date()) {
      if (session) await prisma.session.delete({ where: { id: session.id } });
      throw new HttpError(401, 'Tu sesión ha caducado. Inicia sesión de nuevo.', 'UNAUTHENTICATED');
    }

    req.user = {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      emailVerifiedAt: session.user.emailVerifiedAt,
    };
    req.sessionId = session.id;
    next();
  } catch (error) {
    next(error);
  }
}
