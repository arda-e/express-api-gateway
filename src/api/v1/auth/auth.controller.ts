//** EXTERNAL LIBRARIES
import bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import "express-session";
import { StatusCodes } from "http-status-codes";
import { container } from "tsyringe";
//** INTERNAL UTILS
import {
  UniqueConstraintError,
  ResourceDoesNotExistError,
  AuthenticationError,
  AppError,
  InternalServerError,
} from "@utils/errors/";
import { ResponseBuilder, ErrorResponseBuilder } from "@utils/ResponseBuilder";

//** LOCAL MODULES
import * as DTO from "./auth.dtos";
import AuthService from "./auth.service";

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new user
 *     requestBody:
 *       description: User registration data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/dto.RegisterUserRequest'
 *     responses:
 *       201:
 *         description: User registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/model.User'
 *                     message:
 *                       example: User registered successfully
 *                     statusCode:
 *                       example: 201
 *       409:
 *         description: Email is already registered.
 *         content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/error.UniqueConstraintError'
 */
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authService = container.resolve(AuthService);

    const { username, email, password } = req.body as DTO.RegisterUserRequestDTO;

    const user = await authService.register(username, email, password);

    res
      .status(StatusCodes.CREATED)
      .json(
        new ResponseBuilder()
          .setStatus("success")
          .setStatusCode(StatusCodes.CREATED)
          .setMessage("User registered successfully")
          .setData(user)
          .build(),
      );
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      res
        .status(error.statusCode)
        .json(
          new ErrorResponseBuilder(StatusCodes.CONFLICT, "Email is already registered.").build(),
        );
    } else {
      return next(error);
    }
  }
};

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Log in a user
 *     requestBody:
 *       description: Login credentials
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/dto.LoginUserRequest'
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *              allOf:
 *                 - $ref: '#/components/schemas/common.SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/model.User'
 *                     message:
 *                       example: User logged in successfully
 *                     statusCode:
 *                       example: 200
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error.AuthenticationError'
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authService = container.resolve(AuthService);

    const { email, password } = req.body as DTO.LoginUserRequestDTO;
    const user = await authService.login(email, password);
    req.session.userId = user.id;
    res
      .status(200)
      .json(
        new ResponseBuilder()
          .setStatus("success")
          .setMessage("User logged in successfully")
          .setStatusCode(200)
          .setData(user)
          .build(),
      );
  } catch (error) {
    // !INFO: For security reasons the exact wrong property is not disclosed to the client.
    if (error instanceof AuthenticationError) {
      res
        .status(error.statusCode)
        .json(new ErrorResponseBuilder(error.statusCode, "Wrong email or password.").build());
    } else {
      next(error);
    }
  }
};

/**
 * @openapi
 * /api/v1/auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Logout a user
 *     description: Destroys the user's session and clears the session cookie
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: User logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/common.SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       example: User logged out successfully.
 *                     statusCode:
 *                       example: 200
 *       500:
 *         description: Logout failed
 *         content:
 *           application/json:
 *              schema:
 *                $ref: '#/components/schemas/error.InternalServerError'
 */
export const logout = (req: Request, res: Response, next: NextFunction): void => {
  req.session.destroy((err) => {
    if (err) {
      return next(new InternalServerError("Logout failed."));
    }
    res.clearCookie("connect.sid");
    res
      .status(StatusCodes.OK)
      .json(
        new ResponseBuilder()
          .setStatus("success")
          .setStatusCode(StatusCodes.OK)
          .setMessage("User logged out successfully.")
          .build(),
      );
  });
};

/**
 * @openapi
 * /api/v1/auth/me:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Retrieve current user details
 *     description: Retrieves the details of the currently authenticated user using the session ID.
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/common.SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/model.User'
 *                     message:
 *                       type: string
 *                       example: User retrieved successfully
 *                     statusCode:
 *                       type: integer
 *                       example: 200
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error.ResourceDoesNotExistError'
 */
export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authService = container.resolve(AuthService);

    const user = await authService.getMe(req.session.userId as string);
    res
      .status(StatusCodes.OK)
      .json(
        new ResponseBuilder()
          .setStatus("success")
          .setStatusCode(StatusCodes.OK)
          .setMessage("User retrieved successfully")
          .setData(user)
          .build(),
      );
  } catch (error) {
    if (error instanceof ResourceDoesNotExistError) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json(new ErrorResponseBuilder(StatusCodes.NOT_FOUND, error.message).build());
    } else {
      next(error);
    }
  }
};

//!TODO: Add to route
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authService = container.resolve(AuthService);

    const userId = req.session.userId;
    const updateData = req.body as DTO.UpdateUserRequestDTO;
    const updatedUser = await authService.updateUser(userId!, updateData);

    res
      .status(StatusCodes.OK)
      .json(
        new ResponseBuilder()
          .setStatus("success")
          .setStatusCode(StatusCodes.OK)
          .setMessage("User updated successfully")
          .setData(updatedUser)
          .build(),
      );
  } catch (error) {
    if (error instanceof ResourceDoesNotExistError) {
      res.status(error.statusCode).json({
        status: "error",
        statusCode: error.statusCode,
        message: error.message,
      });
    } else {
      next(error);
    }
  }
};

//!TODO: Add to route
//?TODO: What if the user tries to delete itself
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authService = container.resolve(AuthService);

    const userId = req.session.userId;
    await authService.deleteUser(userId!);
    req.session.destroy((err) => {
      if (err) {
        return next(new AppError(500, "Error during session destruction after user deletion"));
      }
      res.clearCookie("connect.sid");
      const response = {
        status: "success",
        statusCode: 200,
        message: "User deleted successfully",
      };
      res.status(200).json(response);
    });
  } catch (error) {
    if (error instanceof ResourceDoesNotExistError) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json(
          new ResponseBuilder()
            .setStatus("error")
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
    const authService = container.resolve(AuthService);

    const { password, newPassword } = req.body as DTO.ChangePasswordRequestDTO;

    const userId = req.session?.userId || req.user?.id;
    if (!userId) throw new AuthenticationError("Authentication required");

    const user = await authService.getMe(userId);
    const isPasswordValid = await authService.validatePassword(password, user.password);

    if (!isPasswordValid) throw new AuthenticationError("Invalid password");

    const cryptPassword = await bcrypt.hash(newPassword, 10);
    await authService.updateUser(userId, { password: cryptPassword });

    const response = new ResponseBuilder()
      .setStatusCode(StatusCodes.CREATED)
      .setStatus("success")
      .setMessage("Password changed successfully")
      .build();

    res.status(response.statusCode).json(response);
  } catch (error) {
    next(error);
  }
};
