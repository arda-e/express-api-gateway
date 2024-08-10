import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class LoginUserRequestDTO {
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email: string;

  @IsString()
  @Length(6, undefined, { message: 'Password must be at least 6 characters long' })
  password: string;
}

export class RegisterUserRequestDTO {
  @IsString()
  @Length(3, undefined, { message: 'Username must be at least 3 characters long' })
  username: string;

  @IsEmail({}, { message: 'Please enter a valid email address' })
  email: string;

  @IsString()
  @Length(6, undefined, { message: 'Password must be at least 6 characters long' })
  password: string;
}

export class ChangePasswordRequestDTO {
  @IsString()
  @Length(6, undefined, { message: 'Password must be at least 6 characters long' })
  password: string;
}

export class UpdateUserRequestDTO {
  @IsString()
  @IsOptional()
  @Length(3, undefined, { message: 'Username must be at least 3 characters long' })
  username: string;

  @IsOptional()
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email: string;

  @IsOptional()
  @IsString()
  @Length(6, undefined, { message: 'Password must be at least 6 characters long' })
  password: string;
}
