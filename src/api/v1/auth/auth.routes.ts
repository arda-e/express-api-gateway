import { Router } from "express";
import { container } from "tsyringe";
//** INTERNAL MODULES
import { validateRequest, authRequired } from "@middlewares";

import { AuthController } from "./auth.controller";
import * as DTO from "./auth.dtos";

const router = Router();
const authController = container.resolve(AuthController);

// Public routes (no authentication required)
router.post("/login", validateRequest(DTO.LoginUserRequestDTO), authController.login);
router.post(
  "/register",
  validateRequest(DTO.RegisterUserRequestDTO),
  authController.register.bind(authController),
);
router.post(
  "/verify-email",
  validateRequest(DTO.VerifyEmailRequestDTO),
  authController.verifyEmail,
);
router.post(
  "/reset-password",
  validateRequest(DTO.ResetPasswordRequestDTO),
  authController.resetPassword,
);

// Protected routes (authentication required)
router.post("/logout", authRequired, authController.logout);
router.patch(
  "/change-password",
  authRequired,
  validateRequest(DTO.ChangePasswordRequestDTO),
  authController.changePassword,
);

// User profile endpoints (all protected)
router.get("/me", authRequired, authController.getMe);
router.put(
  "/me",
  authRequired,
  validateRequest(DTO.UpdateUserRequestDTO),
  authController.updateUser,
);
router.delete("/me", authRequired, authController.deleteUser);

export default router;
