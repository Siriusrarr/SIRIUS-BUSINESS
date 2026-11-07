import { HttpError } from '../utils/httpError.js';

export function notFound(req, res) {
  res.status(404).json({ message: 'No se encontró el recurso solicitado.' });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error instanceof HttpError) {
    return res.status(error.status).json({ message: error.message, code: error.code });
  }

  if (error?.code === 'P2002') {
    return res.status(409).json({
      message: 'Ya existe una cuenta con ese correo electrónico.',
      code: 'EMAIL_ALREADY_REGISTERED',
    });
  }

  console.error(error);
  return res.status(500).json({
    message: 'Ha ocurrido un error interno. Inténtalo de nuevo más tarde.',
    code: 'INTERNAL_ERROR',
  });
}
