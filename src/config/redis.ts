import { Redis } from 'ioredis';
import { env } from './env.js';
import { logger } from './logger.js';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
  family: 0
});

redis.on('error', (error: Error) => logger.error({ error }, 'Redis error'));

export async function connectRedis() {
  if (redis.status === 'end' || redis.status === 'close') return;
  await redis.connect();
  logger.info('Redis connected');
}
