import { Router } from 'express';

//** INTERNAL MODULES
import * as AuthController from './auth.controller';
import * as DTO from './auth.dtos';
//** INTERNAL UTILS
import { validateRequest } from '@/middlewares';

const router = Router();

router.post('/login', validateRequest(DTO.LoginUserRequestDTO), AuthController.login);
router.post('/register', validateRequest(DTO.RegisterUserRequestDTO), AuthController.register);
router.post('/logout', AuthController.logout);
router.patch(
  '/change-password',
  validateRequest(DTO.ChangePasswordRequestDTO),
  AuthController.changePassword,
);

// router.put('/me', validateRequest(UpdateUserRequestDTO), AuthController.update);
router.get('/me', AuthController.getMe);
// router.delete('/me', AuthController.delete);

export default router;
