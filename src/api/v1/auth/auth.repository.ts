import { injectable } from 'tsyringe';
import { KnexRepository } from '@utils/Repository';

import User from './auth.model';

@injectable()
class AuthRepository extends KnexRepository<User> {
  constructor() {
    super();
  }

  getTableName(): string {
    return 'users';
  }

  async createUser(username: string, email: string, password: string): Promise<User> {
    const user = new User(undefined, username, email, password);
    await user.hashPassword();
    return this.create(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findByField('email', email);
  }
}

export default AuthRepository;
