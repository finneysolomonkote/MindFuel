import Redis from 'ioredis';
import { config } from '@mindfuel/config';
import { logger } from '@mindfuel/utils';

let redis: Redis;

export const initializeRedis = async (): Promise<void> => {
  redis = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

  redis.on('error', (err) => {
    logger.error('Redis error', { error: err });
  });

  redis.on('connect', () => {
    logger.info('Redis connected');
  });

  await redis.ping();
};

export const getRedis = (): Redis => {
  if (!redis) {
    throw new Error('Redis not initialized');
  }
  return redis;
};

export const cacheGet = async (key: string): Promise<any | null> => {
  const cached = await redis.get(key);
  return cached ? JSON.parse(cached) : null;
};

export const cacheSet = async (
  key: string,
  value: any,
  ttlSeconds: number = 3600
): Promise<void> => {
  await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
};

export const cacheDel = async (key: string): Promise<void> => {
  await redis.del(key);
};
