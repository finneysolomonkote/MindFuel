import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const getEnvVarOptional = (key: string, defaultValue?: string): string | undefined => {
  return process.env[key] || defaultValue;
};

export const config = {
  app: {
    name: getEnvVarOptional('APP_NAME', 'MindFuel AI') || 'MindFuel AI',
    env: getEnvVarOptional('NODE_ENV', 'development') || 'development',
    port: parseInt(getEnvVarOptional('API_PORT', '3001') || '3001', 10),
  },

  database: {
    url: getEnvVar('SUPABASE_URL'),
    anonKey: getEnvVar('SUPABASE_ANON_KEY'),
    serviceRoleKey: getEnvVar('SUPABASE_SERVICE_ROLE_KEY'),
  },

  jwt: {
    secret: getEnvVar('JWT_SECRET'),
    expiresIn: getEnvVarOptional('JWT_EXPIRES_IN', '7d') || '7d',
  },

  redis: {
    host: getEnvVarOptional('REDIS_HOST', 'localhost') || 'localhost',
    port: parseInt(getEnvVarOptional('REDIS_PORT', '6379') || '6379', 10),
    password: getEnvVarOptional('REDIS_PASSWORD'),
  },

  openai: {
    apiKey: getEnvVar('OPENAI_API_KEY'),
    model: getEnvVarOptional('OPENAI_MODEL', 'gpt-4-turbo-preview') || 'gpt-4-turbo-preview',
  },

  razorpay: {
    keyId: getEnvVar('RAZORPAY_KEY_ID'),
    keySecret: getEnvVar('RAZORPAY_KEY_SECRET'),
  },

  firebase: {
    projectId: getEnvVar('FIREBASE_PROJECT_ID'),
    privateKey: getEnvVar('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
    clientEmail: getEnvVar('FIREBASE_CLIENT_EMAIL'),
  },

  aws: {
    accessKeyId: getEnvVar('AWS_ACCESS_KEY_ID'),
    secretAccessKey: getEnvVar('AWS_SECRET_ACCESS_KEY'),
    region: getEnvVarOptional('AWS_REGION', 'us-east-1') || 'us-east-1',
    s3Bucket: getEnvVar('AWS_S3_BUCKET'),
  },
};

export default config;
