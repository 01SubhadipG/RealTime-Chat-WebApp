import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import {
    createGroup,
    getUserGroups,
    addMemberToGroup,
    removeMemberFromGroup,
    getGroupDetails
} from '../controllers/group.controller.js';

const router = express.Router();

router.post('/create', protectRoute, createGroup);
router.get('/', protectRoute, getUserGroups);
router.post('/:groupId/add-member', protectRoute, addMemberToGroup);
router.post('/:groupId/remove-member', protectRoute, removeMemberFromGroup);
router.get('/:groupId', protectRoute, getGroupDetails);

export default router;