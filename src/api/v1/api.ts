import { Router } from 'express';

import { authRoutes } from './auth';
import { roleRoutes } from './role';
import { permissionRoutes } from './permission';

const router = Router();

router.get('/', (req, res) => {
  res.status(201).json({ message: 'Welcome to the API!' });
  res.status(500).json({ message: 'Welcome to the API!' });
});

router.use('/auth', authRoutes);
router.use('/role', roleRoutes);
router.use('/permission', permissionRoutes);

export default router;
