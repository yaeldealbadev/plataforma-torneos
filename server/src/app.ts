import express, { type Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import gamesRoutes from './routes/games.routes.js';
import tournamentsRoutes from './routes/tournaments.routes.js';
import registrationsRoutes from './routes/registrations.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

dotenv.config();

const app: Application = express();

// CORS: acepta el origen del frontend (Vite dev server).
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json());

// Healthcheck.
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Rutas de la API.
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/tournaments', tournamentsRoutes);
app.use('/api/registrations', registrationsRoutes);

// Manejador de errores (siempre al final).
app.use(errorHandler);

export default app;
