import BaseModel from '@utils/Model';
import { IsString, Min, Max, IsOptional } from 'class-validator';

class Permission extends BaseModel {
  @IsString()
  @Min(3)
  @Max(50)
  name: string;

  @IsString()
  @IsOptional()
  @Min(10)
  @Max(255)
  description?: string;

  constructor(id: string | undefined, name: string, description?: string) {
    super(id);
    this.name = name;
    this.description = description;
  }
}

export default Permission;
