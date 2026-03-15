import { Queue, Worker } from 'bullmq';
import { config } from '@mindfuel/config';
import { logger } from '@mindfuel/utils';
import { processNotificationJob } from './notification.worker';
import { processEmbeddingJob } from './embedding.worker';

let notificationQueue: Queue;
let embeddingQueue: Queue;

const redisConnection = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
};

export const initializeWorkers = async () => {
  notificationQueue = new Queue('notifications', { connection: redisConnection });
  embeddingQueue = new Queue('embeddings', { connection: redisConnection });

  new Worker('notifications', processNotificationJob, { connection: redisConnection });
  new Worker('embeddings', processEmbeddingJob, { connection: redisConnection });

  logger.info('Workers initialized');
};

export const addNotificationJob = async (data: any) => {
  await notificationQueue.add('send-notification', data);
};

export const addEmbeddingJob = async (data: any) => {
  await embeddingQueue.add('generate-embedding', data);
};
