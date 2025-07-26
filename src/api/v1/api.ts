import { Router } from "express";
import { authRequired } from "@middlewares";

import { authRoutes } from "./auth";
import { roleRoutes } from "./role";
import { permissionRoutes } from "./permission";
import queueRoutes from "./queue/queue.routes";
import { adminRoutes } from "./admin";

const router = Router();

router.get("/", (req, res) => {
  res.status(201).json({ message: "Welcome to the API!" });
});

router.use("/auth", authRoutes);

router.use(authRequired);

router.use("/role", roleRoutes);
router.use("/permission", permissionRoutes);
router.use("/queue", queueRoutes);
router.use("/admin", adminRoutes);

export default router;
