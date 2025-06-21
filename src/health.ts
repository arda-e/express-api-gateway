import { Router } from "express";
import { container } from "tsyringe";
import DatabaseManager from "@db/db.manager";
import { RedisManager } from "@utils/RedisManager";

export const healthRouter = Router();

healthRouter.get("/health/live", (_req, res) => {
  res.sendStatus(200);
});

healthRouter.get("/health/ready", async (_req, res) => {
  try {
    const dbManager = container.resolve(DatabaseManager);
    const redisManager = container.resolve(RedisManager);
    await dbManager.getDatabase().query("SELECT 1");
    await redisManager.getRedisClient().ping();
    res.status(200).json({ db: "ok", redis: "ok" });
  } catch (err: any) {
    console.error("Readiness check failed:", err);
    res.status(503).json({ status: "fail", details: err?.message || String(err) });
  }
});
