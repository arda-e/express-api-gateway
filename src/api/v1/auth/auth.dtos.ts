import { IsEmail, IsOptional, IsString, Length } from "class-validator";

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
  @IsString()
  @Length(3, undefined, { message: "Username must be at least 3 characters long" })
  username: string;

  @IsEmail({}, { message: "Please enter a valid email address" })
  email: string;

  @IsString()
  @Length(6, undefined, { message: "Password must be at least 6 characters long" })
  password: string;
}

// TODO: Add swagger docs
export class ChangePasswordRequestDTO {
  @IsString()
  @Length(6, undefined, { message: "Password must be at least 6 characters long" })
  newPassword: string;

  @IsString()
  password: string;
}

// TODO: Add swagger docs
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

// TODO: Add swagger docs
export class VerifyEmailRequestDTO {
  @IsString()
  token: string;
}
