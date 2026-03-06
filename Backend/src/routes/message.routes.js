import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { sendMessages, getMessages, getUsersForSidebar, sendGroupMessage, getGroupMessages } from '../controllers/message.controller.js';

const router = express.Router();

router.get('/users',protectRoute, getUsersForSidebar);
router.get('/:id', protectRoute, getMessages);

router.post('/send/:id', protectRoute, sendMessages);

router.get('/group/:groupId', protectRoute, getGroupMessages);
router.post('/send-group/:groupId', protectRoute, sendGroupMessage);

export default router;