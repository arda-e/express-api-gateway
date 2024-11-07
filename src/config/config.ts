const dotenv = require('dotenv');
// TODO: Use library like config
dotenv.config();

const config = {
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
    maxRetries: process.env.DB_MAX_RETRIES ? parseInt(process.env.DB_MAX_RETRIES, 10) : 5,
    retryDelay: process.env.DB_RETRY_DELAY ? parseInt(process.env.DB_RETRY_DELAY, 10) : 1000,
  },
  server: {
    environment: process.env.NODE_ENV || 'development',
    shutdownTimeout: process.env.SERVER_SHUTDOWN_TIMEOUT
      ? parseInt(process.env.SERVER_SHUTDOWN_TIMEOUT, 10)
      : 30000,
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 8000,
  },
  app: {
    session: {
      secret: process.env.APP_SESSION_SECRET || 'app-session-secret',
      cookie: {
        maxAge: process.env.APP_SESSION_COOKIE_MAX_AGE
          ? parseInt(process.env.APP_SESSION_COOKIE_MAX_AGE, 10)
          : 300000,
      },
      redis: {
        host: process.env.REDIS_HOST || 'redis',
        port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
        password: process.env.APP_SESSION_REDIS_PASSWORD || '',
        prefix: process.env.APP_SESSION_REDIS_PREFIX || 'session:',
      },
    },
  },
};

console.log('Redis Host:', process.env.REDIS_HOST);
console.log('Redis Port:', process.env.REDIS_PORT);

export default config;
