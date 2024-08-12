import { NextFunction, Request, Response } from 'express';
import { container } from 'tsyringe';
import { ResponseFactory } from '@utils/responses/ResponseFactory';
import { AppError } from '@utils/errors/AppError';

import AuthService from './auth.service';
import { LoginUserRequestDTO, RegisterUserRequestDTO, UpdateUserRequestDTO } from './auth.dtos';

const authService = container.resolve(AuthService);

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, email, password } = req.body as RegisterUserRequestDTO;
    const user = await authService.register(username, email, password);
    const response = ResponseFactory.createResource(user, '/auth/me');
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body as LoginUserRequestDTO;
    const user = await authService.login(email, password);
    req.session.userId = user.id;
    const response = ResponseFactory.getSingleResource(user, '/auth/me');
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const logout = (req: Request, res: Response, next: NextFunction): void => {
  req.session.destroy((err) => {
    if (err) {
      return next(new AppError(500, 'Logout failed'));
    }
    res.clearCookie('connect.sid');
    const response = ResponseFactory.createDeleteResponse();
    res.status(200).json(response);
  });
};

export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await authService.getMe(req.session.userId);
    const response = ResponseFactory.getSingleResource(user, '/auth/me');
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.session.userId;
    const updateData = req.body as UpdateUserRequestDTO;
    const updatedUser = await authService.updateUser(userId, updateData);
    const response = ResponseFactory.createUpdateResponse(updatedUser, '/auth/me');
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.session.userId;
    await authService.deleteUser(userId);
    req.session.destroy((err) => {
      if (err) {
        return next(new AppError(500, 'Error during session destruction after user deletion'));
      }
      res.clearCookie('connect.sid');
      const response = ResponseFactory.createDeleteResponse();
      res.status(200).json(response);
    });
  } catch (error) {
    next(error);
  }
};
