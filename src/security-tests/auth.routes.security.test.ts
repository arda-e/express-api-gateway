import express, { Express } from "express";
import request from "supertest";
import "reflect-metadata";
import { LoginUserRequestDTO, RegisterUserRequestDTO } from "@api/v1/auth/auth.dtos";

import validateRequest from "../middlewares/validator";

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.post("/login", validateRequest(LoginUserRequestDTO), (_req, res) =>
    res.json({ success: true }),
  );
  app.post("/register", validateRequest(RegisterUserRequestDTO), (req, res) =>
    res.status(201).json({ data: req.body }),
  );
  return app;
};

describe("Auth route security", () => {
  let app: Express;

  beforeEach(() => {
    app = createApp();
  });

  it("rejects SQL injection attempts in login", async () => {
    const res = await request(app)
      .post("/login")
      .send({ email: "test@example.com' OR '1'='1", password: "hunter2" });

    expect(res.status).toBe(400);
  });

  it("rejects SQL injection attempts in registration", async () => {
    const res = await request(app)
      .post("/register")
      .send({ username: "attacker", email: "' OR '1'='1", password: "password" });

    expect(res.status).toBe(400);
  });

  it("escapes XSS payloads in username field", async () => {
    const payload = '<script>alert("xss")</script>';
    const res = await request(app)
      .post("/register")
      .send({ username: payload, email: "user@example.com", password: "password" });

    // The request should either be rejected or sanitize the output
    expect([200, 201, 400]).toContain(res.status);
    if (res.status === 201) {
      expect(res.body.data.username).not.toContain("<script>");
    }
  });
});
