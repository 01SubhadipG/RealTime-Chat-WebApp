import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import Group from '../models/group.model.js';
import User from '../models/user.model.js';
import Message from '../models/message.model.js';
import { getReceiverSocketId, io } from "../lib/socket.js";

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});


export const createGroup = async (req, res) => {
    try {
        const { name, description, memberIds, groupImage } = req.body;
        const creatorId = req.user._id;

        // Validate members exist
        const members = await User.find({ _id: { $in: memberIds } });
        if (members.length !== memberIds.length) {
            return res.status(400).json({ message: "Some members not found" });
        }

        // Add creator to members if not already included
        const allMemberIds = [...new Set([creatorId, ...memberIds])];

        let imageUrl = "";
        // Check if cloudinary is configured
        if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
            if (groupImage) {
                if (process.env.CLOUDINARY_UPLOAD_PRESET) {
                    const uploadedResponse = await cloudinary.uploader.upload(groupImage, {
                        upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
                    });
                    imageUrl = uploadedResponse.secure_url;
                } else {
                    console.log("Cloudinary upload preset not configured. Skipping image upload.");
                }
            }
        } else {
            console.log("Cloudinary not configured. Skipping image upload.");
        }


        const newGroup = new Group({
            name,
            description,
            groupImage: imageUrl,
            creator: creatorId,
            members: allMemberIds,
        });

        await newGroup.save();

        // Populate members
        await newGroup.populate('members', 'username email profilePic');
        await newGroup.populate('creator', 'username email profilePic');

        res.status(201).json(newGroup);
    } catch (error) {
        console.error(error);
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
        console.error(error);
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

        // Create system message for member addition
        const adder = await User.findById(userId);
        const systemMessage = new Message({
            groupId: group._id,
            text: `${adder.username} added ${member.username}`,
            messageType: "text"
        });
        await systemMessage.save();

        // notify existing members (and new member) via socket
        // Change this:
        group.members.forEach(memberObj => { // renamed 'id' to 'memberObj' for clarity
            const sid = getReceiverSocketId(memberObj._id); // Use ._id here
            if (sid) {
                io.to(sid).emit("memberAdded", {
                    groupId: group._id,
                    member: member,
                });
                // Also emit the system message
                io.to(sid).emit("newGroupMessage", systemMessage);
            }
        });

        res.status(200).json(group);
    } catch (error) {
        console.error(error);
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

        // Get member info before removing
        const memberToRemove = await User.findById(memberId);
        const remover = await User.findById(userId);

        group.members = group.members.filter(id => String(id) !== String(memberId));
        await group.save();

        await group.populate('members', 'username email profilePic');

        // Create system message for member removal
        const systemMessage = new Message({
            groupId: group._id,
            text: `${remover.username} removed ${memberToRemove.username}`,
            messageType: "text"
        });
        await systemMessage.save();

        // notify remaining members via socket
        // Change this:
        group.members.forEach(memberObj => {
            const sid = getReceiverSocketId(memberObj._id); // Use ._id here
            if (sid) {
                io.to(sid).emit("memberRemoved", {
                    groupId: group._id,
                    memberId,
                });
                // Also emit the system message
                io.to(sid).emit("newGroupMessage", systemMessage);
            }
        });

        res.status(200).json(group);
    } catch (error) {
        console.error(error);
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
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

export const updateGroupDetails = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { name, description } = req.body;
        const userId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        if (!group.members.includes(userId)) {
            return res.status(403).json({ message: "Not authorized to update this group" });
        }

        group.name = name || group.name;
        group.description = description || group.description;

        await group.save();

        await group.populate('members', 'username email profilePic');
        await group.populate('creator', 'username email profilePic');

        // Notify group members of the change
        group.members.forEach(member => {
            const socketId = getReceiverSocketId(member._id.toString());
            if (socketId) {
                io.to(socketId).emit("groupUpdated", group);
            }
        });

        res.status(200).json(group);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

export const updateGroupProfile = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { groupImage } = req.body;
        const userId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        if (!group.members.includes(userId)) {
            return res.status(403).json({ message: "Not authorized to update this group" });
        }

        let imageUrl = "";
        if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
            if (groupImage) {
                if (process.env.CLOUDINARY_UPLOAD_PRESET) {
                    const uploadedResponse = await cloudinary.uploader.upload(groupImage, {
                        upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
                    });
                    imageUrl = uploadedResponse.secure_url;
                } else {
                    console.log("Cloudinary upload preset not configured. Skipping image upload.");
                }
            }
        } else {
            console.log("Cloudinary not configured. Skipping image upload.");
        }

        group.groupImage = imageUrl;
        await group.save();

        await group.populate('members', 'username email profilePic');
        await group.populate('creator', 'username email profilePic');

        res.status(200).json(group);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

export const deleteGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        if (group.creator.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this group" });
        }

        // Delete all messages in the group
        await Message.deleteMany({ groupId: groupId });

        // Notify members that the group is deleted
        group.members.forEach(memberId => {
            const socketId = getReceiverSocketId(memberId.toString());
            if (socketId) {
                io.to(socketId).emit("groupDeleted", { groupId });
            }
        });

        await Group.findByIdAndDelete(groupId);

        res.status(200).json({ message: "Group deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

export const leaveGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        if (!group.members.includes(userId)) {
            return res.status(400).json({ message: "You are not a member of this group" });
        }

        // Remove user from members list
        group.members = group.members.filter(memberId => memberId.toString() !== userId.toString());

        // If the leaving user is the creator, assign a new creator
        if (group.creator.toString() === userId.toString()) {
            if (group.members.length > 0) {
                group.creator = group.members[0];
            }
        }
        
        // If the group has no members left, delete it
        if (group.members.length === 0) {
            await Message.deleteMany({ groupId: groupId });
            await Group.findByIdAndDelete(groupId);
            return res.status(200).json({ message: "Group left and deleted successfully" });
        }

        await group.save();

        const user = await User.findById(userId);

        // Create system message for member leaving
        const systemMessage = new Message({
            groupId: group._id,
            text: `${user.username} left the group`,
            messageType: "text"
        });
        await systemMessage.save();

        // Notify remaining members
        group.members.forEach(memberId => {
            const socketId = getReceiverSocketId(memberId.toString());
            if (socketId) {
                io.to(socketId).emit("memberLeft", { groupId, userId });
                io.to(socketId).emit("newGroupMessage", systemMessage);
            }
        });

        res.status(200).json({ message: "Left group successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};