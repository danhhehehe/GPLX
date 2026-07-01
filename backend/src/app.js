import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import examRoutes from './routes/exam.routes.js';
import licenseRoutes from './routes/license.routes.js';
import questionRoutes from './routes/question.routes.js';
import trafficSignRoutes from './routes/traffic-sign.routes.js';
import clipRoutes from './routes/clip.routes.js';
import dataRoutes from './routes/data.routes.js';
import memoryTipRoutes from './routes/memory-tip.routes.js';
import roadSituationRoutes from './routes/road-situation.routes.js';
import wrongAnswerRoutes from './routes/wrong-answer.routes.js';
import path from 'path';
import { errorHandler, notFound } from './middleware/error.middleware.js';
import { apiWriteLimiter, readLimiter } from './middleware/security.middleware.js';

const app = express();

const clientUrl = process.env.CLIENT_URL || process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const allowedOrigins = new Set([
  clientUrl,
  ...(process.env.NODE_ENV !== 'production' ? ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174'] : [])
].filter(Boolean));

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    const error = new Error('CORS origin is not allowed');
    error.statusCode = 403;
    return callback(error);
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(mongoSanitize());
app.use('/api', readLimiter);
app.use('/api', apiWriteLimiter);

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/static/images/questions', express.static(path.join(process.cwd(), 'storage/images/questions')));
app.use('/static/images/traffic-signs', express.static(path.join(process.cwd(), 'storage/images/traffic-signs')));
app.use('/clip', express.static(path.join(process.cwd(), 'clip')));
app.use('/clip', express.static(path.resolve(process.cwd(), '..', 'clip')));

app.use('/api/questions', questionRoutes);
app.use('/api/exam', examRoutes);
app.use('/api/traffic-signs', trafficSignRoutes);
app.use('/api/clips', clipRoutes);
app.use('/api/licenses', licenseRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/wrong-answers', wrongAnswerRoutes);
app.use('/api/memory-tips', memoryTipRoutes);
app.use('/api/road-situations', roadSituationRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
