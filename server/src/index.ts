import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';

import authRoutes from './routes/auth.routes';
import eventsRoutes from './routes/events.routes';
import suggestionsRoutes from './routes/suggestions.routes';
import pollsRoutes from './routes/polls.routes';
import timetableRoutes from './routes/timetable.routes';
import pastQuestionsRoutes from './routes/past-questions.routes';
import notificationsRoutes from './routes/notifications.routes';
import usersRoutes from './routes/users.routes';
import adminRoutes from './routes/admin.routes';

const app = express();
const server = http.createServer(app);

export const io = new SocketServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
});

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// Serve uploaded files as static
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 20 : 200,
  message: { message: 'Too many attempts, try again later' },
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/suggestions', suggestionsRoutes);
app.use('/api/polls', pollsRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/past-questions', pastQuestionsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/admin', adminRoutes);

// Socket.io: join level rooms on connect
io.on('connection', (socket) => {
  socket.on('join', ({ level }: { level: number }) => {
    socket.join(`level:${level}`);
    socket.join('level:all');
  });

  socket.on('disconnect', () => {
    // cleanup handled by socket.io automatically
  });
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Global error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
