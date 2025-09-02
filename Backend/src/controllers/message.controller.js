import User from '../models/user.model.js';
import Message from '../models/message.model.js';
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

export const sendMessages=async(req,res)=>{
    try{
        const {id:receiverId}=req.params;
        const senderId=req.user._id;
        const {text,image}=req.body;

        if(!text && !image){
            return res.status(400).json({message:"Message cannot be empty"});
        }

        let imageUrl;
        if(image){
            const uploadResponse=await cloudinary.v2.uploader.upload(image);
            imageUrl=uploadResponse.secure_url;
        }

        const newMessage=new Message({
            senderId,
            receiverId,
            text,
            image:imageUrl,  
        });

        // 2. Find the recipient's socket ID
        const receiverSocketId = getReceiverSocketId(receiverId);

        // 3. If the recipient is online, emit a 'newMessage' event to them
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }
        
        // 4. Save the message to the database and send the response
        await newMessage.save();
        res.status(201).json(newMessage);
    }
    catch(error){
        console.error("Error in sendMessage controller: ", error.message);
        res.status(500).json({message:"Server error"});
    }
}