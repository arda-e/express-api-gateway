import { IsEmail, IsOptional, IsString, Length } from "class-validator";
import { Expose, Transform } from "class-transformer";
import sanitizeHtml from "sanitize-html";

/**
 * @swagger
 * components:
 *   schemas:
 *     dto.LoginUserRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: user@example.com
 *         password:
 *           type: string
 *           minLength: 6
 *           example: hunter2
 */
export class LoginUserRequestDTO {
  @Expose()
  @IsEmail({}, { message: "Please enter a valid email address" })
  email: string;

  @IsString()
  @Length(6, undefined, { message: "Password must be at least 6 characters long" })
  password: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     dto.RegisterUserRequest:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           example: JohnDoe
 *         email:
 *           type: string
 *           format: email
 *           example: user@example.com
 *         password:
 *           type: string
 *           minLength: 6
 *           example: hunter2
 */
export class RegisterUserRequestDTO {
  @Expose()
  @Transform(({ value }) => sanitizeHtml(value))
  @IsString()
  @Length(3, undefined, { message: "Username must be at least 3 characters long" })
  username: string;

  @Expose()
  @IsEmail({}, { message: "Please enter a valid email address" })
  email: string;

  @Expose()
  @IsString()
  @Length(6, undefined, { message: "Password must be at least 6 characters long" })
  password: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     dto.ChangePasswordRequest:
 *       type: object
 *       required:
 *         - newPassword
 *         - password
 *       properties:
 *         newPassword:
 *           type: string
 *           minLength: 6
 *           description: The new password for the user
 *           example: StrongPass123
 *         password:
 *           type: string
 *           description: The current password of the user
 *           example: OldPass123
 */
export class ChangePasswordRequestDTO {
  @IsString()
  @Length(6, undefined, { message: "Password must be at least 6 characters long" })
  newPassword: string;

  @IsString()
  password: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     dto.UpdateUserRequest:
 *       type: object
 *       required: []
 *       properties:
 *         username:
 *           type: string
 *           description: Updated username of the user
 *           example: JohnUpdated
 *         email:
 *           type: string
 *           format: email
 *           description: Updated email address
 *           example: new@example.com
 *         password:
 *           type: string
 *           minLength: 6
 *           description: Updated password for the user
 *           example: NewPass123
 */
export class UpdateUserRequestDTO {
  @IsString()
  @IsOptional()
  @Length(3, undefined, { message: "Username must be at least 3 characters long" })
  username?: string;

  @IsOptional()
  @IsEmail({}, { message: "Please enter a valid email address" })
  email?: string;

  @IsOptional()
  @IsString()
  @Length(6, undefined, { message: "Password must be at least 6 characters long" })
  password?: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     dto.VerifyEmailRequest:
 *       type: object
 *       required:
 *         - token
 *       properties:
 *         token:
 *           type: string
 *           description: Verification token sent to the user's email
 *           example: 123e4567-e89b-12d3-a456-426614174000
 */
export class VerifyEmailRequestDTO {
  @IsString()
  token: string;
}

// TODO: Add swagger docs
export class ResetPasswordRequestDTO {
  @IsString()
  token: string;

  @IsString()
  @Length(6, undefined, { message: "Password must be at least 6 characters long" })
  password: string;
}
