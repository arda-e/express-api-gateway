import 'reflect-metadata';
import dotenv from 'dotenv';

import { startServer } from './server';

dotenv.config();

(async () => {
  console.log('Starting server...');
  try {
    await startServer();
    console.log('Server started successfully.');
  } catch (error) {
    console.error('Failed to start the server:', error);
    process.exit(1); // Exit with failure code
  }
})();
