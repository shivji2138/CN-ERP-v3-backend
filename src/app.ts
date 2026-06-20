import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import pinoHttpModule from 'pino-http';
import { env, isProduction } from './config/env.js';
import { logger } from './config/logger.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { apiRouter } from './routes/index.js';

export function createApp() {
  const app = express();
  const pinoHttp = pinoHttpModule as unknown as (options: { logger: typeof logger }) => express.RequestHandler;

  app.set('trust proxy', 1);
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }
    })
  );
  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true
    })
  );
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: isProduction ? 1000 : 5000,
      standardHeaders: true,
      legacyHeaders: false
    })
  );
  app.use(pinoHttp({ logger }));
  app.use(compression());
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(mongoSanitize());

  app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'cybernaut-minutos-api' }));
  app.use('/api/v1', apiRouter);
  app.use(errorMiddleware);

  return app;
}
