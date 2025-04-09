import { Router } from "express";
import { authRequired } from "@middlewares";
import { container } from "tsyringe";

import QueueController from "./queue.controller";

const router = Router();
const queueController = container.resolve(QueueController);

router.get("/items", authRequired, queueController.getAllItemsInQueue);
router.post("/requeue", authRequired, queueController.requeueFromDLQ);

export default router;
