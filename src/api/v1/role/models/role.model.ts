import { ArrayNotEmpty, IsArray, IsBoolean, IsOptional, IsString, Max, Min } from "class-validator";
import BaseModel from "@utils/Model";

/**
 * @swagger
 * components:
 *   schemas:
 *     model.Role:
 *       type: object
 *       required:
 *         - name
 *         - permissions
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated UUID of the role
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         name:
 *           type: string
 *           minLength: 3
 *           description: The name of the role
 *           example: "admin"
 *         description:
 *           type: string
 *           minLength: 10
 *           maxLength: 5000
 *           description: Detailed description of the role's purpose and capabilities
 *           example: "Administrator role with full system access"
 *         isActive:
 *           type: boolean
 *           description: Whether the role is currently active
 *           default: true
 *           example: true
 *         permissions:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *           description: Array of permission IDs associated with this role
 *           example: ["123e4567-e89b-12d3-a456-426614174000", "223e4567-e89b-12d3-a456-426614174001"]
 *         users:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *           description: Array of user IDs assigned to this role
 *           example: ["323e4567-e89b-12d3-a456-426614174002"]
 *       description: Represents a role in the system with associated permissions
 */
class Role extends BaseModel {
  @IsString()
  @Min(3)
  name: string;

  @IsString()
  @IsOptional()
  @Min(10)
  @Max(5000)
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @IsArray()
  @ArrayNotEmpty({ message: "Permissions array should not be empty" })
  @IsString({ each: true, message: "Each permission must be a string" })
  permissions: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true, message: "Each user ID must be a string" })
  users?: string[];
}

export default Role;
