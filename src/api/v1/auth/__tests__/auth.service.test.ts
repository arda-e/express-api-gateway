import "reflect-metadata";
import { AuthenticationError, UniqueConstraintError } from "@utils/errors";
import { EventQueue } from "@utils/queue/EventQueue";

import { UserModel } from "../auth.model";
import { AuthService } from "../auth.service";

const mockRepo = {
  findByEmail: jest.fn(),
  createUser: jest.fn(),
  update: jest.fn(),
};

const mockTokenRepo = {
  createToken: jest.fn(),
  findByToken: jest.fn(),
  deleteById: jest.fn(),
};

const mockQueue = {
  dispatchMany: jest.fn(),
};

describe("AuthService", () => {
  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(mockRepo as any, mockQueue as any, mockTokenRepo as any);
  });

  describe("login", () => {
    it("returns user when credentials are valid", async () => {
      const user = { id: "1", validatePassword: jest.fn().mockResolvedValue(true) } as any;
      mockRepo.findByEmail.mockResolvedValue(user);

      const result = await service.login("test@example.com", "password");

      expect(result).toBe(user);
      expect(mockRepo.findByEmail).toHaveBeenCalledWith("test@example.com");
      expect(user.validatePassword).toHaveBeenCalledWith("password");
    });

    it("throws when user is not found", async () => {
      mockRepo.findByEmail.mockResolvedValue(null);

      await expect(service.login("missing@example.com", "password")).rejects.toBeInstanceOf(
        AuthenticationError,
      );
    });

    it("throws when password is invalid", async () => {
      const user = { id: "1", validatePassword: jest.fn().mockResolvedValue(false) } as any;
      mockRepo.findByEmail.mockResolvedValue(user);

      await expect(service.login("user@example.com", "wrong")).rejects.toBeInstanceOf(
        AuthenticationError,
      );
    });
  });

  describe("register", () => {
    it("throws when email already exists", async () => {
      mockRepo.findByEmail.mockResolvedValue({ id: "1" });

      await expect(service.register("u", "e", "p", {} as any)).rejects.toBeInstanceOf(
        UniqueConstraintError,
      );
    });

    it("creates user and dispatches event", async () => {
      mockRepo.findByEmail.mockResolvedValue(null);
      const newUser = new UserModel("user", "e@x.com", "hash");
      mockRepo.createUser.mockResolvedValue(newUser);
      mockRepo.update.mockImplementation((_id, user) => Promise.resolve(user));

      const result = await service.register("user", "e@x.com", "pass", {} as any);

      expect(result).toBeInstanceOf(UserModel);
      expect(mockRepo.createUser).toHaveBeenCalled();
      expect(mockQueue.dispatchMany).toHaveBeenCalled();
    });
  });
});
