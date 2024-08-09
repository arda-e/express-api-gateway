import { injectable, inject } from 'tsyringe';
import { ResourceDoesNotExistError } from '@utils/errors';

import AuthRepository from './Auth.repository';
import User from './Auth.model';
import { UserAlreadyExistsError } from './errors/UserAlreadyExistsError';

@injectable()
class AuthService {
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
  async deleteUser(id: number): Promise<boolean> {
    const user = await this.authRepository.findById(id);
    if (!user) {
      throw new ResourceDoesNotExistError('User not found');
    }
    return await this.authRepository.deleteById(id);
  }
}

export default AuthService;
