import 'reflect-metadata';
import dotenv from 'dotenv';
import Logger from '@utils/Logger';

import { createDatabase } from './db';
import KnexAdapter from './db/knex.adapter';

dotenv.config();

const PORT = process.env.PORT;

const logger = Logger.getLogger();
export const db = createDatabase(KnexAdapter, 5, 1000);

const startServer = async () => {
  await db.initialize();
  const { default: app } = await import('./app');
  await app.listen(PORT, () => {
    logger.info(`API Gateway running on port3 ${PORT}`);
  });
};
startServer().catch((error) => {
  if (error instanceof Error) {
    logger.error(`Failed to start server: ${error.message}`);
  } else {
    logger.error(`Failed to start server: Unknown error`);
  }
  process.exit(1);
});
