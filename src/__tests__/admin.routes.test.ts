import express, { RequestHandler } from "express";
import request from "supertest";
import "reflect-metadata";
import { container } from "tsyringe";
import adminOnly from "@middlewares/adminOnly";
import errorHandler from "@middlewares/errorHandler";
import { AuthService } from "@api/v1/auth";

const createApp = (middleware: RequestHandler, withSession = true) => {
  const app = express();
  if (withSession) {
    app.use((req, _res, next) => {
      req.session = { userId: "1" } as any;
      next();
    });
  }
  app.get("/admin", middleware, (_req, res) => res.json({ success: true }));
  app.use(errorHandler);
  return app;
};

describe("adminOnly middleware", () => {
  afterEach(() => {
    jest.resetAllMocks();
    container.clearInstances();
  });

  it("rejects non-admin users", async () => {
    const mockGetMe = jest.fn().mockResolvedValue({ roles: [{ name: "user" }] });
    container.registerInstance(AuthService, { getMe: mockGetMe } as any);
    const app = createApp(adminOnly);
    const res = await request(app).get("/admin");
    expect(res.status).toBe(403);
  });

  it("allows admin users", async () => {
    const mockGetMe = jest.fn().mockResolvedValue({ roles: [{ name: "Admin" }] });
    container.registerInstance(AuthService, { getMe: mockGetMe } as any);
    const app = createApp(adminOnly);
    const res = await request(app).get("/admin");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
