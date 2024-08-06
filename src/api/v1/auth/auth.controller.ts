import { NextFunction, Request, Response } from 'express';
import { container } from 'tsyringe';
import { ResponseFactory } from '@utils/responses/ResponseFactory';

import AuthService from './auth.service';

const authService = container.resolve(AuthService);
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, email, password } = req.body;
    const user = await authService.register(username, email, password);
    const [status, response] = ResponseFactory.createResource(user, '/api/v1/auth');
    res.status(status).json(response);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { email, password } = req.body;
  try {
    const user = await authService.login(email, password);
    const [status, response] = ResponseFactory.getSingleResource(user, '/api/v1/auth');
    res.status(status).json(response);
  } catch (error) {
    next(error);
  }
};
