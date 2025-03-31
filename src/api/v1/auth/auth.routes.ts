import { Router } from "express";
//** INTERNAL MODULES
import { validateRequest, authRequired } from "@middlewares";

import AuthController from "./auth.controller";
import * as DTO from "./auth.dtos";

const router = Router();

// Public routes (no authentication required)
router.post("/login", validateRequest(DTO.LoginUserRequestDTO), AuthController.login);
router.post("/register", validateRequest(DTO.RegisterUserRequestDTO), AuthController.register);

// Protected routes (authentication required)
router.post("/logout", authRequired, AuthController.logout);
router.patch(
  "/change-password",
  authRequired,
  validateRequest(DTO.ChangePasswordRequestDTO),
  AuthController.changePassword,
);

// User profile endpoints (all protected)
router.get("/me", authRequired, AuthController.getMe);
router.put(
  "/me",
  authRequired,
  validateRequest(DTO.UpdateUserRequestDTO),
  AuthController.updateUser,
);
router.delete("/me", authRequired, AuthController.deleteUser);

export default router;
