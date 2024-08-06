import express from 'express';

import * as middlewares from './middlewares';
import { api_v1 } from './api/v1/';

const app = express();

app.use(express.json());
app.use(middlewares.logger);

app.get('/', (req, res) => {
  res.status(200).json('Welcome to the API Gateway!');
});

app.use('/api/v1', api_v1);

app.use(middlewares.routeNotFound);
app.use(middlewares.errorHandler);

export default app;
