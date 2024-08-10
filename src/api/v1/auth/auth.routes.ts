import { Router } from 'express';

import * as AuthController from './auth.controller';
import { validateRequest } from '../../../middlewares';
import { LoginUserRequestDTO, RegisterUserRequestDTO } from './auth.dtos';

const router = Router();

router.post('/login', validateRequest(LoginUserRequestDTO), AuthController.login);
router.post('/register', validateRequest(RegisterUserRequestDTO), AuthController.register);
// router.post('/logout', AuthController.logout);
// router.patch('/change-password', validateRequest(ChangePasswordRequestDTO), AuthController.changePassword);

// router.patch('/me', validateRequest(UpdateUserRequestDTO), AuthController.update);
// router.get('/me', AuthController.me);
// router.delete('/me', AuthController.delete);

export default router;
