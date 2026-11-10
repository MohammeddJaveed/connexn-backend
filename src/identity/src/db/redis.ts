import { Redis } from 'ioredis';
import { createLogger } from '@connexn/shared';

const logger = createLogger('identity');

export const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
});

redis.on('connect', () => logger.info({ event: 'redis.connected' }, 'Redis connected'));
redis.on('ready', () => logger.info({ event: 'redis.ready' }, 'Redis ready'));
redis.on('reconnecting', (delayMs: number) =>
  logger.warn({ event: 'redis.reconnecting', delayMs }, 'Redis reconnecting'),
);
redis.on('end', () => logger.warn({ event: 'redis.disconnected' }, 'Redis connection closed'));
redis.on('error', (error) => {
  logger.error({ err: error }, 'Redis connection error');
});
