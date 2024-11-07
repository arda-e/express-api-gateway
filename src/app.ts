import express from 'express';
import { getSessionMiddleware } from '@config/sessionConfig';
import { container } from 'tsyringe';
import { AuthRepository, AuthService } from '@api/v1/auth';

import * as middlewares from './middlewares';
import { api_v1 } from './api/v1/';
import DatabaseManager from './db/db.manager';

const app = express();

app.use(express.json());
app.use(middlewares.logger);

app.use(getSessionMiddleware());

try {
  // Check resolving DatabaseManager
  console.log('Resolving DatabaseManager...');
  const databaseManager = container.resolve(DatabaseManager);
  console.log('DatabaseManager resolved:', databaseManager);

  // Check resolving AuthRepository
  console.log('Resolving AuthRepository...');
  const authRepository = container.resolve(AuthRepository);
  console.log('AuthRepository resolved:', authRepository);

  // Check resolving AuthService
  console.log('Resolving AuthService...');
  const authService = container.resolve(AuthService);
  console.log('AuthService resolved:', authService);
} catch (error) {
  console.error('Error during dependency resolution:', error);
}

app.get('/', (req, res) => {
  res.status(200).json('Welcome to the API Gateway!');
});

app.use('/api/v1', api_v1);
app.use(middlewares.errorHandler);
app.use(middlewares.routeNotFound);

export default app;
