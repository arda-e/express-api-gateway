import "reflect-metadata";
import bcrypt from "bcryptjs";
import { ResourceDoesNotExistError, UniqueConstraintError, ValidationError } from "@utils/errors";
import { EventQueue } from "@utils/queue/EventQueue";

import { AuthService } from "../auth.service";
import { UserModel } from "../auth.model";
import { UserState } from "../auth.states";
import { AuthRepository } from "../index";

jest.mock("@utils/decorators", () => ({
  ExceptionHandler: () => (_t: any, _p: string, d: PropertyDescriptor) => d,
  Transaction: () => (_t: any, _p: string, d: PropertyDescriptor) => d,
  RequiresTransaction: () => (_t: any, _p: string, d: PropertyDescriptor) => d,
}));

jest.mock("../auth.entity", () => ({
  UserEntity: {
    create: (model: any) => ({
      transition: () => ({
        raise: () => ({
          getDomainEvents: () => [],
          toModel: () => model,
        }),
      }),
    }),
  },
}));

jest.mock("bcryptjs");

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe("AuthService", () => {
  let repository: jest.Mocked<AuthRepository>;
  let queue: jest.Mocked<EventQueue>;
  let service: AuthService;

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn(),
      deleteById: jest.fn(),
      createUser: jest.fn(),
    } as unknown as jest.Mocked<AuthRepository>;
    queue = {
      dispatchMany: jest.fn(),
      addEvent: jest.fn(),
      addJob: jest.fn(),
      removeJob: jest.fn(),
      getJobStats: jest.fn(),
      getJobs: jest.fn(),
    } as unknown as jest.Mocked<EventQueue>;
    service = new AuthService(repository, queue);
    jest.clearAllMocks();
  });

  describe("getMe", () => {
    it("returns user when found", async () => {
      const user = { id: "1", email: "a@b.com", state: UserState.REGISTERED } as UserModel;
      repository.findById.mockResolvedValue(user);

      const result = await service.getMe("1");

      expect(repository.findById).toHaveBeenCalledWith("1");
      expect(result).toBe(user);
    });

    it("throws ResourceDoesNotExistError when user is missing", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.getMe("1")).rejects.toThrow();
    });
  });

  describe("updateUser", () => {
    it("updates user when email is unchanged", async () => {
      const user = { id: "1", email: "a@b.com", state: UserState.REGISTERED } as UserModel;
      const updated = { id: "1", email: "a@b.com", username: "new" } as UserModel;
      repository.findById.mockResolvedValue(user);
      repository.update.mockResolvedValue(updated);

      const result = await service.updateUser("1", { username: "new" });

      expect(repository.update).toHaveBeenCalledWith("1", { username: "new" }, undefined);
      expect(result).toBe(updated);
    });

    it("throws ResourceDoesNotExistError when user not found", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.updateUser("1", { username: "x" })).rejects.toThrow();
    });

    it("throws UniqueConstraintError when email already exists", async () => {
      const user = { id: "1", email: "a@b.com", state: UserState.REGISTERED } as UserModel;
      repository.findById.mockResolvedValue(user);
      repository.findByEmail.mockResolvedValue({ id: "2" } as UserModel);

      await expect(service.updateUser("1", { email: "new@b.com" })).rejects.toThrow();
    });
  });

  describe("deleteUser", () => {
    it("deletes existing user", async () => {
      const user = { id: "1", email: "a@b.com", state: UserState.REGISTERED } as UserModel;
      repository.findById.mockResolvedValue(user);
      repository.deleteById.mockResolvedValue(true);

      const result = await service.deleteUser("1");

      expect(queue.dispatchMany).toHaveBeenCalledTimes(1);
      expect(repository.deleteById).toHaveBeenCalledWith("1", undefined);
      expect(result).toBe(true);
    });

    it("throws ResourceDoesNotExistError when user missing", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.deleteUser("1")).rejects.toThrow();
      expect(queue.dispatchMany).not.toHaveBeenCalled();
    });
  });

  describe("changePassword", () => {
    it("hashes and updates password", async () => {
      const user = { id: "1", email: "a@b.com", state: UserState.ONBOARDED } as UserModel;
      const updated = { id: "1", email: "a@b.com", password: "hash" } as UserModel;
      repository.findById.mockResolvedValue(user);
      (mockedBcrypt.hash as unknown as jest.Mock).mockResolvedValue("hash");
      repository.update.mockResolvedValue(updated);

      const result = await service.changePassword("1", "newPass");

      expect(mockedBcrypt.hash).toHaveBeenCalledWith("newPass", 10);
      expect(queue.dispatchMany).toHaveBeenCalledTimes(1);
      expect(repository.update).toHaveBeenCalledWith("1", { password: "hash" }, undefined);
      expect(result).toBe(updated);
    });

    it("throws ResourceDoesNotExistError when user not found", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.changePassword("1", "newPass")).rejects.toThrow();
      expect(mockedBcrypt.hash).not.toHaveBeenCalled();
    });
  });

  describe("validatePassword", () => {
    it("returns true when passwords match", async () => {
      (mockedBcrypt.compare as unknown as jest.Mock).mockResolvedValue(true);

      await expect(service.validatePassword("a", "b")).resolves.toBe(true);
    });

    it("returns false when passwords do not match", async () => {
      (mockedBcrypt.compare as unknown as jest.Mock).mockResolvedValue(false);

      await expect(service.validatePassword("a", "b")).resolves.toBe(false);
    });

    it("throws ValidationError on bcrypt failure", async () => {
      (mockedBcrypt.compare as unknown as jest.Mock).mockRejectedValue(new Error("fail"));

      await expect(service.validatePassword("a", "b")).rejects.toThrow();
    });
  });
});
