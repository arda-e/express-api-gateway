import bcrypt from 'bcryptjs';
import Model from '@utils/Model';
import { IsEmail, IsString, Length } from 'class-validator';

class User extends Model {
  @IsString()
  @Length(3)
  username: string;
  @IsEmail()
  email: string;
  @IsString()
  @Length(6)
  password: string;

  constructor(id: string | undefined, username: string, email: string, password: string) {
    super(id);
    this.username = username;
    this.email = email;
    this.password = password;
  }

  async hashPassword(): Promise<void> {
    this.password = await bcrypt.hash(this.password, 10);
  }

  async validatePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }
}

export default User;
