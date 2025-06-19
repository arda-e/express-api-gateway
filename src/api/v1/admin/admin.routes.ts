import { Router } from "express";
import { container } from "tsyringe";
import { authRequired } from "@middlewares/authRequired";
import adminOnly from "@middlewares/adminOnly";

import AdminController from "./admin.controller";

const router = Router();
const controller = container.resolve(AdminController);

router.use(authRequired, adminOnly);
router.get("/health", controller.health);

export default router;
