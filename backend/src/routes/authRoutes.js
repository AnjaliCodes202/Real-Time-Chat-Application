import express from 'express';
import { signup, login, logout, checkAuth, refreshToken } from '../controllers/authController.js';
import { protectRoute } from '../middleware/authMiddleware.js';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redisClient } from '../lib/redis.js';

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: 'Too many authentication attempts from this IP, please try again after 15 minutes' },
    standardHeaders: true, 
    legacyHeaders: false,
});

const router = express.Router();

router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.post('/logout', protectRoute, logout);
router.post('/refresh', refreshToken);
router.get('/check', protectRoute, checkAuth);

export default router;
