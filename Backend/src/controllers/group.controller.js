import Group from '../models/group.model.js';
import User from '../models/user.model.js';

export const createGroup = async (req, res) => {
    try {
        const { name, description, memberIds } = req.body;
        const creatorId = req.user._id;

        // Validate members exist
        const members = await User.find({ _id: { $in: memberIds } });
        if (members.length !== memberIds.length) {
            return res.status(400).json({ message: "Some members not found" });
        }

        // Add creator to members if not already included
        const allMemberIds = [...new Set([creatorId, ...memberIds])];

        const newGroup = new Group({
            name,
            description,
            creator: creatorId,
            members: allMemberIds,
        });

        await newGroup.save();

        // Populate members
        await newGroup.populate('members', 'username email profilePic');
        await newGroup.populate('creator', 'username email profilePic');

        res.status(201).json(newGroup);
    } catch (error) {
        console.error("Error creating group:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getUserGroups = async (req, res) => {
    try {
        const userId = req.user._id;

        const groups = await Group.find({ members: userId })
            .populate('members', 'username email profilePic')
            .populate('creator', 'username email profilePic')
            .sort({ updatedAt: -1 });

        res.status(200).json(groups);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const addMemberToGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { memberId } = req.body;
        const userId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // Check if user is a member of the group
        if (!group.members.includes(userId)) {
            return res.status(403).json({ message: "Not authorized to add members" });
        }

        // Check if member exists
        const member = await User.findById(memberId);
        if (!member) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if already a member
        if (group.members.includes(memberId)) {
            return res.status(400).json({ message: "User is already a member" });
        }

        group.members.push(memberId);
        await group.save();

        await group.populate('members', 'username email profilePic');

        // notify existing members (and new member) via socket
        group.members.forEach(id => {
            const sid = getReceiverSocketId(id);
            if (sid) {
                io.to(sid).emit("memberAdded", {
                    groupId: group._id,
                    member: member,
                });
            }
        });

        res.status(200).json(group);
    } catch (error) {
        console.error("Error adding member to group:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// remove member route handler
export const removeMemberFromGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { memberId } = req.body;
        const userId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // Only existing member can remove others (or maybe creator?). We'll permit any member.
        if (!group.members.includes(userId)) {
            return res.status(403).json({ message: "Not authorized to remove members" });
        }

        // check if target is in group
        if (!group.members.includes(memberId)) {
            return res.status(400).json({ message: "User is not a member" });
        }

        group.members = group.members.filter(id => String(id) !== String(memberId));
        await group.save();

        await group.populate('members', 'username email profilePic');

        // notify remaining members via socket
        group.members.forEach(id => {
            const sid = getReceiverSocketId(id);
            if (sid) {
                io.to(sid).emit("memberRemoved", {
                    groupId: group._id,
                    memberId,
                });
            }
        });

        res.status(200).json(group);
    } catch (error) {
        console.error("Error removing member from group:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getGroupDetails = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;

        const group = await Group.findById(groupId)
            .populate('members', 'username email profilePic')
            .populate('creator', 'username email profilePic');

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // Check if user is a member
        if (!group.members.some(member => member._id.toString() === userId.toString())) {
            return res.status(403).json({ message: "Not authorized to view this group" });
        }

        res.status(200).json(group);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};