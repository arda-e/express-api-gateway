import bcrypt from 'bcryptjs';
import BaseModel from '@utils/Model';
import { IsArray, IsEmail, IsString, Length, ValidateNested } from 'class-validator';
import Role from '@api/v1/role/models/role.model';
import { Type } from 'class-transformer';

class User extends BaseModel {
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

export default User;
