import "reflect-metadata";
import express from "express";
import session from "express-session";
import request from "supertest";
import { container } from "tsyringe";
import errorHandler from "@middlewares/errorHandler";
import routeNotFound from "@middlewares/routeNotFound";

import { AuthService } from "../auth.service";

const mockService = {
  login: jest.fn(),
  register: jest.fn(),
  getMe: jest.fn(),
};

// Register mock before importing routes
container.registerInstance(AuthService, mockService as any);

const authRoutes = require("../auth.routes").default;

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use(session({ secret: "test", resave: false, saveUninitialized: true }));
  app.use("/api/v1/auth", authRoutes);
  app.use(errorHandler);
  app.use(routeNotFound);
  return app;
};

describe("auth routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("POST /login returns user", async () => {
    const user = { id: "1", email: "test@example.com" };
    mockService.login.mockResolvedValue(user);

    const res = await request(buildApp())
      .post("/api/v1/auth/login")
      .send({ email: "test@example.com", password: "pass" })
      .expect(200);

    expect(res.body.data).toEqual(user);
    expect(mockService.login).toHaveBeenCalledWith("test@example.com", "pass");
  });

  it("GET /me requires authentication", async () => {
    const app = buildApp();
    await request(app).get("/api/v1/auth/me").expect(401);
  });

  it("GET /me returns current user when authenticated", async () => {
    const user = { id: "1", email: "a@b.com" };
    mockService.login.mockResolvedValue(user);
    mockService.getMe.mockResolvedValue(user);

    const agent = request.agent(buildApp());
    await agent.post("/api/v1/auth/login").send({ email: "a@b.com", password: "p" }).expect(200);

    const res = await agent.get("/api/v1/auth/me").expect(200);
    expect(res.body.data).toEqual(user);
  });
});
