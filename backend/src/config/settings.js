const required = ['DATABASE_URL'];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Falta la variable obligatoria ${key}. Revisa backend/.env.`);
  }
}

const sameSite = (process.env.COOKIE_SAME_SITE || 'lax').toLowerCase();
if (!['lax', 'strict', 'none'].includes(sameSite)) {
  throw new Error('COOKIE_SAME_SITE debe ser lax, strict o none.');
}

export const settings = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  appUrl: (process.env.APP_URL || 'http://localhost:5173').replace(/\/$/, ''),
  cookieName: process.env.SESSION_COOKIE_NAME || 'sirius_session',
  sessionDurationDays: Number(process.env.SESSION_DURATION_DAYS || 7),
  cookieSameSite: sameSite,
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM,
  },
};

if (!Number.isInteger(settings.port) || settings.port < 1 || settings.port > 65535) {
  throw new Error('PORT no es válido.');
}
if (!Number.isInteger(settings.sessionDurationDays) || settings.sessionDurationDays < 1) {
  throw new Error('SESSION_DURATION_DAYS debe ser un entero positivo.');
}
