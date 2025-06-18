import bcrypt from "bcryptjs";
import { inject, injectable } from "tsyringe";
import { Knex } from "knex";
import {
  AuthenticationError,
  ResourceDoesNotExistError,
  UniqueConstraintError,
  ValidationError,
} from "@utils/errors";
import { ExceptionHandler, Transaction } from "@utils/decorators";
import { EventQueue } from "@utils/queue/EventQueue";
import { UserEntity } from "@api/v1/auth/auth.entity";
import { UserAction, USER_DELETED, USER_PASSWORD_RESET } from "@api/v1/auth/auth.states";
import { EventType } from "@utils/queue/EventTypes";

import { UserModel } from "./auth.model";
import * as DTO from "./auth.dtos";
import AuthRepository from "./auth.repository";

@injectable()
export class AuthService {
  constructor(
    @inject(AuthRepository) private authRepository: AuthRepository,
    @inject(EventQueue) private eventQueue: EventQueue,
  ) {}

  @ExceptionHandler("Failed to register user")
  @Transaction()
  async register(
    username: string,
    email: string,
    password: string,
    trx?: Knex.Transaction,
  ): Promise<UserModel> {
    const existingUser = await this.authRepository.findByEmail(email, trx);
    if (existingUser) throw new UniqueConstraintError("User already exists");

    const newUser = await this.authRepository.createUser(
      username,
      email,
      password,
      ["cbd0bdfe-6240-4a9d-8882-e1df7a9938ed"],
      trx!,
    );

    const entity = await UserEntity.create(newUser)
      .transition(UserAction.REGISTER)
      .persist(this.authRepository, trx!);

    await this.eventQueue.dispatchMany([
      {
        type: EventType.UserRegistered,
        payload: { userId: entity.id, email: entity.model.email },
      },
    ]);
    return entity.toModel();
  }

  @ExceptionHandler("Failed to login user")
  async login(username: string, password: string): Promise<UserModel> {
    const user = await this.authRepository.findByEmail(username);
    if (!user) throw new AuthenticationError("User not found");

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) throw new AuthenticationError("Invalid password");

    return user;
  }

  @ExceptionHandler((params: { userId: string }) => `Failed to retrieve user ${params.userId}`)
  async getMe(userId: string): Promise<UserModel> {
    const user = await this.authRepository.findById(userId);
    if (!user) throw new ResourceDoesNotExistError("User not found");
    return user;
  }

  @ExceptionHandler("Failed to update user")
  @Transaction()
  async updateUser(
    userId: string,
    updateData: DTO.UpdateUserRequestDTO,
    trx?: Knex.Transaction,
  ): Promise<UserModel> {
    const user = await this.authRepository.findById(userId, trx);
    if (!user) throw new ResourceDoesNotExistError("User not found");

    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await this.authRepository.findByEmail(updateData.email, trx);
      if (existingUser) throw new UniqueConstraintError("Email already in use");
    }

    return await this.authRepository.update(userId, updateData, trx!);
  }

  @ExceptionHandler((userId) => `Failed to delete user with id ${userId}`)
  @Transaction()
  async deleteUser(userId: string, trx?: Knex.Transaction): Promise<boolean> {
    const user = await this.authRepository.findById(userId, trx);
    if (!user) throw new ResourceDoesNotExistError("User not found");

    const entity = UserEntity.create(user)
      .transition(UserAction.DELETE)
      .raise(USER_DELETED as unknown as EventType);

    await this.eventQueue.dispatchMany(entity.getDomainEvents() as any);
    return await this.authRepository.deleteById(userId, trx!);
  }

  @ExceptionHandler("Failed to change password")
  @Transaction()
  async changePassword(
    userId: string,
    newPassword: string,
    trx?: Knex.Transaction,
  ): Promise<UserModel> {
    const user = await this.authRepository.findById(userId, trx);
    if (!user) throw new ResourceDoesNotExistError("User not found");

    const cryptPassword = await bcrypt.hash(newPassword, 10);

    const entity = UserEntity.create(user)
      .transition(UserAction.RESET_PASSWORD)
      .raise(USER_PASSWORD_RESET as unknown as EventType);

    await this.eventQueue.dispatchMany(entity.getDomainEvents() as any);
    return await this.authRepository.update(userId, { password: cryptPassword }, trx!);
  }

  async validatePassword(plainTextPassword: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(plainTextPassword, hashedPassword);
    } catch (error) {
      console.error("Error validating password:", error);
      throw new ValidationError("Password validation failed");
    }
  }
}
