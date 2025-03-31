//** EXTERNAL LIBRARIES
import bcrypt from "bcryptjs";
import { IsArray, IsEmail, IsString, Length, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
//** LOCAL MODULES
import BaseModel from "@utils/Model";
import Role from "@api/v1/role/models/role.model";

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
export class User extends BaseModel {
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

  constructor(
    id: string | undefined,
    username: string,
    email: string,
    password: string,
    roles: Role[] = [],
  ) {
    super(id);
    this.username = username;
    this.email = email;
    this.password = password;
    this.roles = roles;
  }

  async hashPassword(): Promise<void> {
    this.password = await bcrypt.hash(this.password, 10);
  }

  async validatePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }
}
