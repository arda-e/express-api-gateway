import 'reflect-metadata';
import dotenv from 'dotenv';

import { startServer } from './server';

console.log('Starting server...');
dotenv.config();

startServer();
