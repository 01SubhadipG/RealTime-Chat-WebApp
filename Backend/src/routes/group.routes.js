import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import {
    createGroup,
    getUserGroups,
    addMemberToGroup,
    removeMemberFromGroup,
    getGroupDetails,
    updateGroupProfile,
    updateGroupDetails,
    leaveGroup
} from '../controllers/group.controller.js';

const router = express.Router();

router.post('/create', protectRoute, createGroup);
router.get('/', protectRoute, getUserGroups);
router.post('/:groupId/add-member', protectRoute, addMemberToGroup);
router.post('/:groupId/remove-member', protectRoute, removeMemberFromGroup);
router.get('/:groupId', protectRoute, getGroupDetails);
router.post('/update-profile/:groupId', protectRoute, updateGroupProfile);
router.put('/:groupId/update-details', protectRoute, updateGroupDetails);
router.post('/:groupId/leave', protectRoute, leaveGroup);

export default router;