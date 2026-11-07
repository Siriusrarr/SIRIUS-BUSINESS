import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { settings } from './config/settings.js';
import { prisma } from './config/prisma.js';
import authRoutes from './routes/authRoutes.js';
import businessRoutes from './routes/businessRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();
const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);
const frontendDirectory = path.resolve(currentDirectory, '../../frontend/dist');
const frontendIndex = path.join(frontendDirectory, 'index.html');

app.disable('x-powered-by');
app.use(helmet());
app.use(express.json({ limit: '20kb' }));
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Sirius Business API' });
});

app.use('/api/auth', authRoutes);
app.use('/api', businessRoutes);

// En producción Express sirve también React: web y API quedan bajo el mismo dominio.
if (existsSync(frontendIndex)) {
  app.use(express.static(frontendDirectory, { index: false }));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api/')) {
      return res.sendFile(frontendIndex);
    }
    return next();
  });
}

app.use(notFound);
app.use(errorHandler);

const server = app.listen(settings.port, () => {
  console.log(`Sirius Business API disponible en http://localhost:${settings.port}`);
});

async function shutdown(signal) {
  console.log(`${signal} recibido. Cerrando Sirius Business...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
