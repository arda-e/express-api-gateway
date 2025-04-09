import { Router } from "express";
import { authRequired } from "@middlewares";
import { container } from "tsyringe";

import QueueController from "./queue.controller";

const router = Router();
const queueController = container.resolve(QueueController);

router.get("/items", authRequired, queueController.getAllItemsInQueue);
router.post("/requeue", authRequired, queueController.requeueFromDLQ);
router.get("/dashboard", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>Queue Dashboard</title></head>
        <body>
          <h1>Hello, Queue World!</h1>
          <p>This is a placeholder for the SSR React queue dashboard.</p>
        </body>
      </html>
    `);
});

export default router;
