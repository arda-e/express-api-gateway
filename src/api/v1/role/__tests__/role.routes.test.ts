import "reflect-metadata";
import express from "express";
import session from "express-session";
import request from "supertest";
import { container } from "tsyringe";
import { RoleActions } from "@utils/enums";

import errorHandler from "@/middlewares/errorHandler";
import routeNotFound from "@/middlewares/routeNotFound";
import RoleService from "../role.service";

jest.mock("@api/v1/auth", () => ({
  User: class {},
  AuthRepository: class {},
}));

jest.mock("@middlewares", () => ({
  authorization: jest.fn((perms: string[]) => {
    const mw = (_req: any, _res: any, next: any) => next();
    (mw as any).__permissions = perms;
    return mw;
  }),
  validateRequest: jest.fn(() => (_req: any, _res: any, next: any) => next()),
}));
const { authorization } = require("@middlewares");

const mockService = {
  getRoles: jest.fn(),
  getRole: jest.fn(),
  createRole: jest.fn(),
  updateRole: jest.fn(),
  deleteRole: jest.fn(),
  assignRoleToUser: jest.fn(),
  removeRoleFromUser: jest.fn(),
  getUserRoles: jest.fn(),
  assignPermissionToRole: jest.fn(),
  removePermissionFromRole: jest.fn(),
  getRolePermissions: jest.fn(),
};

container.registerInstance(RoleService, mockService as any);
let roleRoutes = require("../role.routes").default;

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use(session({ secret: "test", resave: false, saveUninitialized: true }));
  app.use("/api/v1/role", roleRoutes);
  app.use(errorHandler);
  app.use(routeNotFound);
  return app;
};

describe("role routes", () => {
  beforeEach(() => {
    mockService.getRoles.mockReset();
    mockService.getRole.mockReset();
    mockService.createRole.mockReset();
    mockService.updateRole.mockReset();
    mockService.deleteRole.mockReset();
    mockService.assignRoleToUser.mockReset();
    mockService.removeRoleFromUser.mockReset();
    mockService.getUserRoles.mockReset();
    mockService.assignPermissionToRole.mockReset();
    mockService.removePermissionFromRole.mockReset();
    mockService.getRolePermissions.mockReset();
  });

  it("GET /role returns roles", async () => {
    mockService.getRoles.mockResolvedValue([]);
    await request(buildApp()).get("/api/v1/role").expect(200);
    expect(mockService.getRoles).toHaveBeenCalled();
  });

  it("POST /role creates role", async () => {
    const role = { id: "1" };
    mockService.createRole.mockResolvedValue(role);
    const res = await request(buildApp()).post("/api/v1/role").send({ name: "new" }).expect(201);
    expect(res.body.data).toEqual(role);
    expect(mockService.createRole).toHaveBeenCalled();
  });

  it("applies correct permissions", () => {
    const perms = authorization.mock.calls.map((c: any) => c[0]);
    expect(perms).toContainEqual([RoleActions.CREATE_ROLE]);
    expect(perms).toContainEqual([RoleActions.READ_ROLE]);
    expect(perms).toContainEqual([RoleActions.UPDATE_ROLE]);
    expect(perms).toContainEqual([RoleActions.DELETE_ROLE]);
    expect(perms).toContainEqual([RoleActions.ASSIGN_ROLE]);
    expect(perms).toContainEqual(["assign:permission"]);
  });
});
