import { NextFunction, Request, Response } from 'express';
import { container } from 'tsyringe';
import { AppError } from '@utils/errors/AppError';
import {
  UniqueConstraintError,
  ResourceDoesNotExistError,
  AuthenticationError,
} from '@utils/errors/';
import 'express-session';
import { StatusCodes } from 'http-status-codes';
import { ResponseBuilder, ErrorResponseBuilder } from '@utils/ResponseBuilder';
import bcrypt from 'bcryptjs';

import AuthService from './auth.service';
import {
  ChangePasswordRequestDTO,
  LoginUserRequestDTO,
  RegisterUserRequestDTO,
  UpdateUserRequestDTO,
} from './auth.dtos';

const authService = container.resolve(AuthService);

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.log('AuthController: Received registration request');
  try {
    const { username, email, password } = req.body as RegisterUserRequestDTO;

    const user = await authService.register(username, email, password);

    res
      .status(StatusCodes.CREATED)
      .json(
        new ResponseBuilder()
          .setStatus('success')
          .setStatusCode(StatusCodes.CREATED)
          .setMessage('User registered successfully')
          .setData(user)
          .build(),
      );
  } catch (error) {
    console.log('AuthController: Error during registration:', error);
    if (error instanceof UniqueConstraintError) {
      res
        .status(error.statusCode)
        .json(
          new ErrorResponseBuilder(StatusCodes.CONFLICT, 'Email is already registered.').build(),
        );
    } else {
      return next(error);
    }
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body as LoginUserRequestDTO;
    const user = await authService.login(email, password);
    req.session.userId = user.id;
    res
      .status(200)
      .json(
        new ResponseBuilder()
          .setStatus('success')
          .setMessage('User logged in successfully')
          .setStatusCode(200)
          .setData(user)
          .build(),
      );
  } catch (error) {
    // !INFO: For security reasons the exact wrong property is not disclosed to the client.
    if (error instanceof AuthenticationError) {
      res
        .status(error.statusCode)
        .json(new ErrorResponseBuilder(error.statusCode, 'Wrong email or password.').build());
    } else {
      next(error);
    }
  }
};

export const logout = (req: Request, res: Response, next: NextFunction): void => {
  req.session.destroy((err) => {
    if (err) {
      return next(new AppError(500, 'Logout failed'));
    }
    res.clearCookie('connect.sid');
    res
      .status(StatusCodes.OK)
      .json(
        new ResponseBuilder()
          .setStatus('success')
          .setStatusCode(StatusCodes.OK)
          .setMessage('User logged out successfully.')
          .build(),
      );
  });
};

export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await authService.getMe(req.session.userId as string);
    res
      .status(StatusCodes.OK)
      .json(
        new ResponseBuilder()
          .setStatus('success')
          .setStatusCode(StatusCodes.OK)
          .setMessage('User retrieved successfully')
          .setData(user)
          .build(),
      );
  } catch (error) {
    if (error instanceof ResourceDoesNotExistError) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json(
          new ResponseBuilder()
            .setStatus('error')
            .setStatusCode(StatusCodes.NOT_FOUND)
            .setMessage(error.message)
            .build(),
        );
    } else {
      next(error);
    }
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
    const updatedUser = await authService.updateUser(userId!, updateData);

    res
      .status(StatusCodes.OK)
      .json(
        new ResponseBuilder()
          .setStatus('success')
          .setStatusCode(StatusCodes.OK)
          .setMessage('User updated successfully')
          .setData(updatedUser)
          .build(),
      );
  } catch (error) {
    if (error instanceof ResourceDoesNotExistError) {
      res.status(error.statusCode).json({
        status: 'error',
        statusCode: error.statusCode,
        message: error.message,
      });
    } else {
      next(error);
    }
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.session.userId;
    await authService.deleteUser(userId!);
    req.session.destroy((err) => {
      if (err) {
        return next(new AppError(500, 'Error during session destruction after user deletion'));
      }
      res.clearCookie('connect.sid');
      const response = {
        status: 'success',
        statusCode: 200,
        message: 'User deleted successfully',
      };
      res.status(200).json(response);
    });
  } catch (error) {
    if (error instanceof ResourceDoesNotExistError) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json(
          new ResponseBuilder()
            .setStatus('error')
            .setStatusCode(StatusCodes.NOT_FOUND)
            .setMessage(error.message)
            .build(),
        );
    } else {
      next(error);
    }
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { password, newPassword } = req.body as ChangePasswordRequestDTO;

    const userId = req.session?.userId || req.user?.id; // Adjust according to your auth setup
    if (!userId) throw new AuthenticationError('Authentication required');

    const user = await authService.getMe(userId);
    const isPasswordValid = await authService.validatePassword(password, user.password);

    if (!isPasswordValid) throw new AuthenticationError('Invalid password');

    const cryptPassword = await bcrypt.hash(newPassword, 10);
    await authService.updateUser(userId, { password: cryptPassword });

    const response = new ResponseBuilder()
      .setStatusCode(StatusCodes.CREATED)
      .setStatus('success')
      .setMessage('Password changed successfully')
      .build();

    res.status(response.statusCode).json(response);
  } catch (error) {
    next(error);
  }
};
