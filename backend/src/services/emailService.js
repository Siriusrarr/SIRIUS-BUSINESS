import nodemailer from 'nodemailer';
import { settings } from '../config/settings.js';

function getTransporter() {
  const { host, port, secure, user, pass, from } = settings.smtp;
  if (!host || !user || !pass || !from) {
    throw new Error('El servicio de correo no está configurado. Completa SMTP_HOST, SMTP_USER, SMTP_PASS y SMTP_FROM en backend/.env.');
  }

  return {
    from,
    transporter: nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    }),
  };
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

async function send({ to, subject, text, html }) {
  const { transporter, from } = getTransporter();
  await transporter.sendMail({ from, to, subject, text, html });
}

export async function sendVerificationEmail(user, token) {
  const url = `${settings.appUrl}/verify-email?token=${encodeURIComponent(token)}`;
  const safeName = escapeHtml(user.name);
  await send({
    to: user.email,
    subject: 'Verifica tu correo | Sirius Business',
    text: `Hola ${user.name}. Verifica tu correo entrando en este enlace: ${url}. El enlace caduca en 24 horas.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#172033"><h1 style="color:#101827">Sirius Business</h1><p>Hola ${safeName},</p><p>Confirma tu dirección de correo para activar tu cuenta.</p><p><a href="${url}" style="display:inline-block;padding:13px 20px;background:#9be6d3;color:#10221f;text-decoration:none;border-radius:9px;font-weight:bold">Verificar correo</a></p><p>Este enlace caduca en 24 horas. Si no has creado una cuenta, ignora este mensaje.</p></div>`,
  });
}

export async function sendPasswordResetEmail(user, token) {
  const url = `${settings.appUrl}/reset-password?token=${encodeURIComponent(token)}`;
  const safeName = escapeHtml(user.name);
  await send({
    to: user.email,
    subject: 'Recupera tu acceso | Sirius Business',
    text: `Hola ${user.name}. Puedes establecer una nueva contraseña desde este enlace: ${url}. El enlace caduca en una hora.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#172033"><h1 style="color:#101827">Sirius Business</h1><p>Hola ${safeName},</p><p>Hemos recibido una solicitud para cambiar la contraseña de tu cuenta.</p><p><a href="${url}" style="display:inline-block;padding:13px 20px;background:#9be6d3;color:#10221f;text-decoration:none;border-radius:9px;font-weight:bold">Crear nueva contraseña</a></p><p>El enlace caduca en una hora. Si no has solicitado este cambio, ignora este mensaje. Tu contraseña no cambiará.</p></div>`,
  });
}
