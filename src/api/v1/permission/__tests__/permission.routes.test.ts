import "reflect-metadata";
import express from "express";
import session from "express-session";
import request from "supertest";
import { container } from "tsyringe";
import errorHandler from "@middlewares/errorHandler";
import routeNotFound from "@middlewares/routeNotFound";

import PermissionService from "../permission.service";

const mockService = {
  getPermissions: jest.fn(),
  getPermission: jest.fn(),
  createPermission: jest.fn(),
  updatePermission: jest.fn(),
  deletePermission: jest.fn(),
};

container.registerInstance(PermissionService, mockService as any);

const permissionRoutes = require("../permission.routes").default;

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use(session({ secret: "test", resave: false, saveUninitialized: true }));
  app.use("/api/v1/permission", permissionRoutes);
  app.use(errorHandler);
  app.use(routeNotFound);
  return app;
};

describe("permission routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET /permission returns permissions", async () => {
    mockService.getPermissions.mockResolvedValue({ permissions: [], total: 0 });

    await request(buildApp()).get("/api/v1/permission").expect(200);
    expect(mockService.getPermissions).toHaveBeenCalled();
  });

  it("POST /permission creates permission", async () => {
    const perm = { id: "1" };
    mockService.createPermission.mockResolvedValue(perm);

    const res = await request(buildApp())
      .post("/api/v1/permission")
      .send({ name: "read:perm" })
      .expect(201);
    expect(res.body.data).toEqual(perm);
    expect(mockService.createPermission).toHaveBeenCalled();
  });
});
