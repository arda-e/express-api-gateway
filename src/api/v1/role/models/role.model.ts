import BaseModel from '@utils/Model';
import { ArrayNotEmpty, IsArray, IsBoolean, IsOptional, IsString, Max, Min } from 'class-validator';

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
  @ArrayNotEmpty({ message: 'Permissions array should not be empty' })
  @IsString({ each: true, message: 'Each permission must be a string' })
  permissions: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true, message: 'Each user ID must be a string' })
  users?: string[];
}

export default Role;
