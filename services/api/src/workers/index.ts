import { Queue, Worker } from 'bullmq';
import { getRedis } from '../lib/redis';
import { logger } from '@mindfuel/utils';
import { processNotificationJob } from './notification.worker';
import { processEmbeddingJob } from './embedding.worker';

let notificationQueue: Queue;
let embeddingQueue: Queue;

export const initializeWorkers = async () => {
  const redis = getRedis();

  notificationQueue = new Queue('notifications', { connection: redis });
  embeddingQueue = new Queue('embeddings', { connection: redis });

  new Worker('notifications', processNotificationJob, { connection: redis });
  new Worker('embeddings', processEmbeddingJob, { connection: redis });

  logger.info('Workers initialized');
};

export const addNotificationJob = async (data: any) => {
  await notificationQueue.add('send-notification', data);
};

export const addEmbeddingJob = async (data: any) => {
  await embeddingQueue.add('generate-embedding', data);
};
