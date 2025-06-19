import "reflect-metadata";
import { ResourceAlreadyExistsError, ResourceDoesNotExistError } from "@utils/errors";

import PermissionService from "../permission.service";

const mockRepo = {
  findAllPaginated: jest.fn(),
  findById: jest.fn(),
  findByField: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  deleteById: jest.fn(),
  findByUserId: jest.fn(),
};

describe("PermissionService", () => {
  let service: PermissionService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PermissionService(mockRepo as any);
  });

  describe("getPermissionByUserId", () => {
    it("returns permissions for user", async () => {
      const perms = [{ id: "1", name: "read" }];
      mockRepo.findByUserId.mockResolvedValue(perms);

      const result = await service.getPermissionByUserId("user1");

      expect(result).toBe(perms);
      expect(mockRepo.findByUserId).toHaveBeenCalledWith("user1");
    });

    it("throws when none found", async () => {
      mockRepo.findByUserId.mockResolvedValue([]);

      await expect(service.getPermissionByUserId("u")).rejects.toBeInstanceOf(
        ResourceDoesNotExistError,
      );
    });
  });

  describe("createPermission", () => {
    it("throws when permission exists", async () => {
      mockRepo.findByField.mockResolvedValue([{}]);

      await expect(service.createPermission({} as any)).rejects.toBeInstanceOf(
        ResourceAlreadyExistsError,
      );
    });

    it("creates permission", async () => {
      const perm = { id: "1", name: "create" } as any;
      mockRepo.findByField.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue(perm);

      const result = await service.createPermission(perm);

      expect(result).toBe(perm);
      expect(mockRepo.create).toHaveBeenCalledWith(perm);
    });
  });

  describe("getPermissions", () => {
    it("returns paginated result with defaults", async () => {
      mockRepo.findAllPaginated.mockResolvedValue({ data: [], total: 0 });

      const result = await service.getPermissions();

      expect(result).toEqual({ data: [], total: 0, page: 1, limit: 10 });
      expect(mockRepo.findAllPaginated).toHaveBeenCalledWith(1, 10);
    });

    it("uses provided page and limit", async () => {
      mockRepo.findAllPaginated.mockResolvedValue({ data: [], total: 0 });

      const result = await service.getPermissions(2, 5);

      expect(result.page).toBe(2);
      expect(result.limit).toBe(5);
      expect(mockRepo.findAllPaginated).toHaveBeenCalledWith(2, 5);
    });
  });
});
