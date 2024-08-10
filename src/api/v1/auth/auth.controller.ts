import { NextFunction, Request, Response } from 'express';
import { container } from 'tsyringe';
import { ResponseFactory } from '@utils/responses/ResponseFactory';
import { UserResponseDTO } from '@api/v1/auth/dtos/UserResponseDTO';

import AuthService from './auth.service';

const authService = container.resolve(AuthService);
export const register = async (req: Request, res: Response, next: NextFunction) => {
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
    req.session.userId = user.id;

    const [status, response] = ResponseFactory.getSingleResource(user, '/api/v1/auth');
    res.status(status).json(response);
  } catch (error) {
    next(error);
  }
};

export const logout = (req: Request, res: Response, next: NextFunction): void => {
  req.session.destroy((err) => {
    if (err) {
      return next(err); // TODO: Check error type and handle it in the error handler
    }
    res.clearCookie('connect.sid');
    // TODO: Fix response factory
    const [status, response] = ResponseFactory.getSingleResource(null, '/api/v1/auth');
    res.status(status).json({ message: 'Logged out successfully' }); // TODO Handle response in the response factorys
  });
};

export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await authService.getMe(req.session.userId);
    const [status, response] = ResponseFactory.getSingleResource(user, '/api/v1/auth');
    res.status(status).json(response);
  } catch (error) {
    next(error);
  }
};
