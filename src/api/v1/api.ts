import { Router } from 'express'
import { authRoutes } from './auth'
const router = Router()

// Base route
router.get('/', (req, res) => {
    res.send('Welcome to api v1');
});

// Use auth routes
router.use('/auth', authRoutes);

export default router