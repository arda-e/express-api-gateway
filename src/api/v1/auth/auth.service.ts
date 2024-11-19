//** EXTERNAL LIBRARIES
import bcrypt from 'bcryptjs';
import { inject, injectable } from 'tsyringe';
//** INTERNAL UTILS
import {
  AuthenticationError,
  ResourceDoesNotExistError,
  UniqueConstraintError,
  ValidationError,
} from '@utils/errors';

//** INTERNAL MODULES
import User from './auth.model';
import * as DTO from './auth.dtos';
import AuthRepository from './auth.repository';

// import RoleRepository from '@api/v1/role/repositories/role.repository';

@injectable()
export class AuthService {
  constructor(@inject(AuthRepository) private authRepository: AuthRepository) {}

  async register(username: string, email: string, password: string): Promise<User> {
    console.log('AuthService: Starting registration');
    const existingUser = await this.authRepository.findByEmail(email);

    if (existingUser) {
      //!TODO: Convert to logger
      console.log('AuthService: User already exists, throwing error');
      throw new UniqueConstraintError('User already exists');
    }

    const newUser = await this.authRepository.createUser(
      username,
      email,
      password,
      ['cbd0bdfe-6240-4a9d-8882-e1df7a9938ed'],
      // !TODO: Replace with the actual role ID
    );
    //!TODO: Convert to logger
    console.log('AuthService: Registration successful');
    return newUser;
  }

  async login(email: string, password: string): Promise<User> {
    const user = await this.authRepository.findByEmail(email);

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    const isPasswordValid = await user.validatePassword(password);

    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid password');
    }

    return user;
  }

  async getMe(userId: string): Promise<User> {
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new ResourceDoesNotExistError('User not found');
    }
    return user;
  }

  async updateUser(userId: string, updateData: DTO.UpdateUserRequestDTO): Promise<User> {
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new ResourceDoesNotExistError('User not found');
    }

    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await this.authRepository.findByEmail(updateData.email);
      if (existingUser) {
        throw new UniqueConstraintError('email', 'Email already in use');
      }
    }

    return await this.authRepository.update(userId, updateData);
  }

  async deleteUser(userId: string): Promise<boolean> {
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new ResourceDoesNotExistError('User not found');
    }
    return await this.authRepository.deleteById(userId);
  }

  async validatePassword(plainTextPassword: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(plainTextPassword, hashedPassword);
    } catch (error) {
      console.error('Error validating password:', error);
      throw new ValidationError('Password validation failed');
    }
  }
}

export default AuthService;
