import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config';
import { logger } from './utils';
import { errorHandler } from './middleware/error-handler';
import { notFoundHandler } from './middleware/not-found';
import { apiLimiter } from './middleware/rate-limit';
import routes from './routes';
import { initializeSupabase } from './lib/supabase';
import { initializeFirebase } from './lib/firebase';
import { initializeWorkers } from './workers';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined'));
app.use('/api', apiLimiter);

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    initializeSupabase();
    logger.info('Supabase initialized');

    initializeFirebase();
    logger.info('Firebase initialized');

    await initializeWorkers();
    logger.info('Background workers initialized');

    const port = config.app.port;
    app.listen(port, () => {
      logger.info(`Server running on port ${port}`, {
        env: config.app.env,
        name: config.app.name,
      });
    });
  } catch (error) {
    logger.error('Failed to start server', { error: String(error) });
    process.exit(1);
  }
};

startServer();

export default app;
