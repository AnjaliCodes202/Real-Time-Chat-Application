import express from 'express';
import { protectRoute } from '../middleware/authMiddleware.js';
import { getMessages, sendMessage, editMessage, deleteMessage, markAsRead } from '../controllers/messageController.js';

const router = express.Router();

router.get('/:id', protectRoute, getMessages);
router.post('/send/:id', protectRoute, sendMessage);
router.put('/:id', protectRoute, editMessage);
router.put('/read/:id', protectRoute, markAsRead);
router.delete('/:id', protectRoute, deleteMessage);

export default router;
