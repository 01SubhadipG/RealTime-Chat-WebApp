import User from '../models/user.model.js';
import Message from '../models/message.model.js';
import Group from '../models/group.model.js';
import cloudinary from 'cloudinary';
// 1. Import Socket.IO essentials from your socket setup file
import { getReceiverSocketId, io } from '../lib/socket.js';

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select('-password');
        res.status(200).json(filteredUsers);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}

export const getMessages = async (req, res) => {
    try{
        const {id:userToChatId}=req.params;
        const senderId=req.user._id;
        const messages=await Message.find({
            $or:[
                {senderId,receiverId:userToChatId},
                {senderId:userToChatId,receiverId:senderId}
            ]
        }).sort({createdAt:1}); // Sort messages by creation time
        res.status(200).json(messages);
    }
    catch(error){
        res.status(500).json({message:"Server error"});
    }
}

export const getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;

        // Check if user is a member of the group
        const group = await Group.findById(groupId);
        if (!group || !group.members.includes(userId)) {
            return res.status(403).json({ message: "Not authorized to view messages" });
        }

        const messages = await Message.find({ groupId }).sort({ createdAt: 1 });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}

export const sendMessages = async (req, res) => {
  try {
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    const { text, file, fileName, messageType } = req.body;

    if (!text && !file) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    let fileUrl;
    if (file) {
      const uploadResponse = await cloudinary.v2.uploader.upload(file, {
        resource_type: "auto",
        folder: "chat_documents", 
        flags: "attachment", // <--- ADD THIS LINE
      });
      fileUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      file: fileUrl,
      fileName: fileName || "attachment",
      // If it's a doc, we mark it as 'file' for the frontend to render an icon
      messageType: messageType || (file ? "file" : "text"),
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Cloudinary Upload Error:", error.message);
    res.status(500).json({ message: "Failed to send document" });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const senderId = req.user._id;
    const { text, file, fileName, messageType } = req.body;

    if (!text && !file) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    // Check if user is a member of the group
    const group = await Group.findById(groupId);
    if (!group || !group.members.includes(senderId)) {
      return res.status(403).json({ message: "Not authorized to send messages to this group" });
    }

    let fileUrl;
    if (file) {
      const uploadResponse = await cloudinary.v2.uploader.upload(file, {
        resource_type: "auto",
        folder: "chat_documents", 
        flags: "attachment",
      });
      fileUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      groupId,
      text,
      file: fileUrl,
      fileName: fileName || "attachment",
      messageType: messageType || (file ? "file" : "text"),
    });

    await newMessage.save();

    // Emit to all group members except sender
    group.members.forEach(memberId => {
      if (memberId.toString() !== senderId.toString()) {
        const receiverSocketId = getReceiverSocketId(memberId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("newGroupMessage", newMessage);
        }
      }
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending group message:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};