//** EXTERNAL LIBRARIES
import bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import "express-session";
import { StatusCodes } from "http-status-codes";
import { container, injectable, delay, inject } from "tsyringe";
// INTERNAL UTILS
import { AuthenticationError, AppError, InternalServerError } from "@utils/errors/";
import { ResponseBuilder } from "@utils/ResponseBuilder";
import { Controller } from "@utils/decorators/Controller";
import { ManualErrorLogging } from "@utils/decorators/CustomErrorHandling";

// LOCAL MODULES
import * as DTO from "./auth.dtos";
import AuthService from "./auth.service";

@Controller({ logging: true })
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
  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { username, email, password } = req.body as DTO.RegisterUserRequestDTO;

    const user = await this.authService.register(username, email, password);

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
  };

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
  public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { email, password } = req.body as DTO.LoginUserRequestDTO;
    const user = await this.authService.login(email, password);
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
  public logout = (req: Request, res: Response, next: NextFunction): void => {
    req.session.destroy((err) => {
      if (err) return next(new InternalServerError("Logout failed."));

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
  public getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = await this.authService.getMe(req.session.userId as string);
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
  };

  public updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.session.userId;
    const updateData = req.body as DTO.UpdateUserRequestDTO;
    const updatedUser = await this.authService.updateUser(userId!, updateData);

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
  };

  public deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.session.userId;
    await this.authService.deleteUser(userId!);

    req.session.destroy((err) => {
      if (err)
        return next(new AppError(500, "Error during session destruction after user deletion"));

      res.clearCookie("connect.sid");
      res
        .status(StatusCodes.OK)
        .json(
          new ResponseBuilder()
            .setStatus("success")
            .setStatusCode(StatusCodes.OK)
            .setMessage("User deleted successfully")
            .build(),
        );
    });
  };

  public changePassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const { password, newPassword } = req.body as DTO.ChangePasswordRequestDTO;

    const userId = req.session?.userId || req.user?.id;
    if (!userId) throw new AuthenticationError("Authentication required");

    const user = await this.authService.getMe(userId);
    const isPasswordValid = await this.authService.validatePassword(password, user.password);

    if (!isPasswordValid) throw new AuthenticationError("Invalid password");

    const cryptPassword = await bcrypt.hash(newPassword, 10);
    await this.authService.updateUser(userId, { password: cryptPassword });

    const response = new ResponseBuilder()
      .setStatusCode(StatusCodes.CREATED)
      .setStatus("success")
      .setMessage("Password changed successfully")
      .build();

    res.status(response.statusCode).json(response);
  };
}

export default container.resolve(AuthController);
