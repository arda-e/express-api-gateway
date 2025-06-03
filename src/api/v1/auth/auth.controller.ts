// EXTERNAL LIBRARIES
import { NextFunction, Request, Response } from "express";
import "express-session";
import { container, injectable, delay, inject } from "tsyringe";
// INTERNAL UTILS
import { AuthenticationError, InternalServerError } from "@utils/errors/";
import { ApiResponse } from "@utils/Response";
import { Route, Benchmark, Logger, InvalidateCache, Controller, Cache } from "@utils/decorators";

import * as DTO from "./auth.dtos";
import { User } from "./auth.model";
import AuthService from "./auth.service";

@Controller({ logging: true, benchmarking: true })
@injectable()
export class AuthController {
  constructor(
    /* injected with delay to prevent circular dependencies */
    @inject(delay(() => AuthService)) private authService: AuthService,
  ) {}

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
  @Route()
  @Benchmark()
  @Logger()
  public async register(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<ApiResponse<User>> {
    const { username, email, password } = req.body as DTO.RegisterUserRequestDTO;

    const user = await this.authService.register(username, email, password);
    return ApiResponse.created(user, "User registered successfully");
  }

  /**
   * Example of a method with manual error logging
   * This method handles sensitive information, so it implements custom error logging
   *
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
  @Route()
  @Benchmark()
  @Logger()
  public async login(req: Request, res: Response, next: NextFunction): Promise<ApiResponse<User>> {
    const { email, password } = req.body as DTO.LoginUserRequestDTO;
    const user = await this.authService.login(email, password);
    req.session.userId = user.id;

    return ApiResponse.success(user, "User logged in successfully");
  }

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
  @Route()
  @Logger()
  @InvalidateCache("user:*")
  public async logout(req: Request, res: Response, next: NextFunction): Promise<ApiResponse<null>> {
    return new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          reject(new InternalServerError("Logout failed."));
          return;
        }

        res.clearCookie("connect.sid");
        resolve(ApiResponse.success(null, "User logged out successfully"));
      });
    });
  }

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
  @Route()
  @Benchmark()
  @Logger()
  @Cache({ ttl: 600_000 })
  public async getMe(req: Request, res: Response, next: NextFunction): Promise<ApiResponse<User>> {
    const user = await this.authService.getMe(req.session.userId as string);
    return ApiResponse.success(user, "User retrieved successfully");
  }

  /**
   * @openapi
   * /api/v1/auth/me:
   *   put:
   *     tags:
   *       - Auth
   *     summary: Update current user details
   *     description: Updates the details of the currently authenticated user.
   *     security:
   *       - sessionAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/dto.UpdateUserRequest'
   *     responses:
   *       200:
   *         description: User updated successfully
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
   *                       example: User updated successfully
   *                     statusCode:
   *                       example: 200
   */
  @Route()
  @Benchmark()
  @Logger()
  @InvalidateCache("user:*")
  public async updateUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<ApiResponse<User>> {
    const userId = req.session.userId;

    if (!userId) {
      throw new AuthenticationError("User not authenticated");
    }

    const updateData = req.body as DTO.UpdateUserRequestDTO;
    const updatedUser = await this.authService.updateUser(userId, updateData);

    return ApiResponse.success(updatedUser, "User updated successfully");
  }

  /**
   * @openapi
   * /api/v1/auth/me:
   *   delete:
   *     tags:
   *       - Auth
   *     summary: Delete current user
   *     description: Deletes the currently authenticated user's account.
   *     security:
   *       - sessionAuth: []
   *     responses:
   *       200:
   *         description: User deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/common.SuccessResponse'
   *                 - type: object
   *                   properties:
   *                     message:
   *                       example: User deleted successfully
   *                     statusCode:
   *                       example: 200
   */
  @Route()
  @Benchmark()
  @Logger()
  @InvalidateCache("user:*")
  public async deleteUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<ApiResponse<null>> {
    const userId = req.session.userId;

    if (!userId) {
      throw new AuthenticationError("User not authenticated");
    }

    await this.authService.deleteUser(userId);

    return new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          reject(new InternalServerError("Error during session destruction after user deletion"));
          return;
        }

        res.clearCookie("connect.sid");
        resolve(ApiResponse.success(null, "User deleted successfully"));
      });
    });
  }

  @Route()
  @Benchmark()
  @Logger()
  public async changePassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<ApiResponse<null>> {
    const { password, newPassword } = req.body as DTO.ChangePasswordRequestDTO;

    const userId = req.session?.userId || req.user?.id;
    if (!userId) {
      throw new AuthenticationError("Authentication required");
    }

    const user = await this.authService.getMe(userId);
    const isPasswordValid = await this.authService.validatePassword(password, user.password);

    if (!isPasswordValid) {
      throw new AuthenticationError("Invalid password");
    }

    await this.authService.changePassword(userId, newPassword);
    return ApiResponse.success(null, "Password changed successfully");
  }
}

export default container.resolve(AuthController);
