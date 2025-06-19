import "reflect-metadata";
import { ResourceAlreadyExistsError, ResourceDoesNotExistError } from "@utils/errors";

import RoleService from "../role.service";

jest.mock("@api/v1/auth", () => ({
  User: class {},
  AuthRepository: class {},
}));

const mockRoleRepo = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByField: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  deleteById: jest.fn(),
};
const mockAuthRepo = { findById: jest.fn() };
const mockUserRoleRepo = {
  assignRoleToUser: jest.fn(),
  removeRoleFromUser: jest.fn(),
  getUserRoles: jest.fn(),
  getUsersByRole: jest.fn(),
};
const mockPermissionRepo = {
  assignPermissionToRole: jest.fn(),
  removePermissionFromRole: jest.fn(),
  getRolePermissions: jest.fn(),
};

describe("RoleService", () => {
  let service: RoleService;
  beforeEach(() => {
    jest.clearAllMocks();
    service = new RoleService(
      mockRoleRepo as any,
      mockAuthRepo as any,
      mockUserRoleRepo as any,
      mockPermissionRepo as any,
    );
  });

  describe("createRole", () => {
    it("throws when role already exists", async () => {
      mockRoleRepo.findByField.mockResolvedValue({ id: "1" });
      await expect(service.createRole({ name: "admin" } as any)).rejects.toMatchObject({
        code: "RESOURCE_ALREADY_EXISTS",
      });
    });

    it("creates role when not existing", async () => {
      const role = { id: "1", name: "user" } as any;
      mockRoleRepo.findByField.mockResolvedValue(null);
      mockRoleRepo.create.mockResolvedValue(role);
      const result = await service.createRole(role);
      expect(result).toBe(role);
      expect(mockRoleRepo.create).toHaveBeenCalledWith(role);
    });
  });

  describe("getRole", () => {
    it("returns role when found", async () => {
      const role = { id: "1" } as any;
      mockRoleRepo.findById.mockResolvedValue(role);
      const result = await service.getRole("1");
      expect(result).toBe(role);
    });

    it("throws when missing", async () => {
      mockRoleRepo.findById.mockResolvedValue(null);
      await expect(service.getRole("42")).rejects.toMatchObject({
        code: "RESOURCE_NOT_FOUND",
      });
    });
  });

  describe("assignRoleToUser", () => {
    it("assigns role when user and role exist", async () => {
      const user = { id: "u1" } as any;
      const role = { id: "r1" } as any;
      mockRoleRepo.findById.mockResolvedValue(role);
      mockAuthRepo.findById.mockResolvedValueOnce(user).mockResolvedValueOnce(user);
      mockUserRoleRepo.assignRoleToUser.mockResolvedValue({});

      const result = await service.assignRoleToUser("u1", "r1");

      expect(mockUserRoleRepo.assignRoleToUser).toHaveBeenCalledWith("u1", "r1");
      expect(result).toBe(user);
    });

    it("throws when user missing", async () => {
      mockRoleRepo.findById.mockResolvedValue({ id: "r1" });
      mockAuthRepo.findById.mockResolvedValue(null);
      await expect(service.assignRoleToUser("u2", "r1")).rejects.toMatchObject({
        code: "RESOURCE_NOT_FOUND",
      });
    });
  });
});
