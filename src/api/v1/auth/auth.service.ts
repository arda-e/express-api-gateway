import { inject, injectable } from 'tsyringe';
import { ResourceDoesNotExistError, UserAlreadyExistsError } from '@utils/errors';

import User from './auth.model';
import AuthRepository from './auth.repository';
import { UpdateUserRequestDTO } from './auth.dtos';

@injectable()
export class AuthService {
  constructor(@inject(AuthRepository) private authRepository: AuthRepository) {}

  async register(username: string, email: string, password: string): Promise<User> {
    const existingUser = await this.authRepository.findByEmail(email);

    if (existingUser) {
      throw new UserAlreadyExistsError('User already exists');
    }

    return await this.authRepository.createUser(username, email, password);
  }

  async login(email: string, password: string): Promise<User> {
    const user = await this.authRepository.findByEmail(email);

    if (!user) {
      throw new ResourceDoesNotExistError('User not found');
    }

    const isPasswordValid = await user.validatePassword(password);

    if (!isPasswordValid) {
      throw new ResourceDoesNotExistError('Invalid password');
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

  async updateUser(userId: string, updateData: UpdateUserRequestDTO): Promise<User> {
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new ResourceDoesNotExistError('User not found');
    }

    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await this.authRepository.findByEmail(updateData.email);
      if (existingUser) {
        throw new UserAlreadyExistsError('Email already in use');
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
}

export default AuthService;
