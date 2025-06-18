//** EXTERNAL LIBRARIES
import bcrypt from "bcryptjs";
import { IsArray, IsBoolean, IsEmail, IsString, Length, ValidateNested } from "class-validator";
import { Transform, Type } from "class-transformer";
//** LOCAL MODULES
import BaseModel from "@utils/Model";
import Role from "@api/v1/role/models/role.model";
import { UserState } from "@api/v1/auth/auth.states";

/**
 * @swagger
 * components:
 *   schemas:
 *     model.User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated UUID of the user
 *         username:
 *           type: string
 *           minLength: 3
 *           description: The username of the user
 *         email:
 *           type: string
 *           format: email
 *           description: The email address of the user
 *         password:
 *           type: string
 *           format: password
 *           minLength: 6
 *           description: The hashed password of the user
 *         roles:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/model.Role'
 *           description: The roles assigned to the user
 *       example:
 *         id: "550e8400-e29b-41d4-a716-446655440000"
 *         username: "johndoe"
 *         email: "john.doe@example.com"
 *         password: "$2a$10$abcdefghijklmnopqrstuvwxyz123456789"
 *         roles: []
 */
export class UserModel extends BaseModel {
  @IsString()
  @Length(3)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(6)
  password: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Role)
  roles: Role[];

  @IsBoolean()
  emailVerified: boolean;

  @Transform(({ value }) => value as UserState)
  state: UserState;

  constructor(
    username: string,
    email: string,
    password: string,
    emailVerified = false,
    roles: Role[] = [],
    state: UserState = UserState.NEW,
    id?: string | undefined,
    created_at?: Date,
    updated_at?: Date,
  ) {
    super(id, created_at, updated_at);
    this.username = username.trim();
    this.email = email.toLowerCase().trim();
    this.password = password;
    this.roles = roles;
    this.state = state;
    this.emailVerified = Boolean(emailVerified);
  }

  async hashPassword(): Promise<void> {
    this.password = await bcrypt.hash(this.password, 10);
  }

  async validatePassword(plainPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, this.password);
  }

  toRecord(): Record<string, any> {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      password: this.password,
      email_verified: this.emailVerified,
      created_at: this.created_at,
      updated_at: this.updated_at,
      state: this.state,
    };
  }

  static fromRecord(row: any): UserModel {
    return new UserModel(
      row.id,
      row.username,
      row.email,
      row.password,
      row.roles ?? [],
      row.email_verified,
      row.created_at,
      row.updated_at,
      row.state,
    );
  }
}
