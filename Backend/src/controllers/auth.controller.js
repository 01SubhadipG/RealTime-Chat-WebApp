import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

export const login=(req,res)=>{
    const {email,password}=req.body;
    try{
        if(!email || !password){
            return res.status(400).json({message:"Please enter all fields"});
        }
        User.findOne({email}).then(user=>{
            if(!user){
                return res.status(400).json({message:"User does not exist"});
            }
            bcrypt.compare(password,user.password).then(isMatch=>{
                if(!isMatch){
                    return res.status(400).json({message:"Invalid credentials"});
                }
                generateToken(user._id,res);
                res.status(200).json({
                    message:"Login successful",
                    user
                });
            });
        });
    }
    catch(error){
        res.status(500).json({message:"Server error"});
    }
}
export const signup=async(req,res)=>{
    const {username,email,password}=req.body;
    try{
        if(!username || !email || !password){
            return res.status(400).json({message:"Please enter all fields"});
        }
        if(password.length<6){
            return res.status(400).json({message:"Password must be at least 6 characters long"});
        }
        const userExists=await User.findOne({email});
        if(userExists){
            return res.status(400).json({message:"User already exists"});
        }
        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password,salt);
        const newUser=new User({
            username,
            email,
            password:hashedPassword,
        });
        if(newUser){
            generateToken(newUser._id,res);
            await newUser.save();
            res.status(201).json({
                message:"User created successfully",
                User:newUser
            });
        }else{
            res.status(400).json({message:"Invalid user data"});
        }

    }
    catch(error){
        res.status(500).json({message:"Server error"});
    }
}
export const logout=(req,res)=>{
    try{
        res.cookie('jwt', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            expires: new Date(0), // Expire the cookie immediately
        });
        res.status(200).json({message:"Logout successful"});
    }
    catch(error){
        res.status(500).json({message:"Server error"});
    }
}
export const updateProfile = async (req, res) => {
    try {
        const { username, bio, profilePic } = req.body;
        const userId = req.user._id;

        // DEBUG 1: Let's verify the user ID
        console.log("Attempting to update user with this ID:", userId);

        const updatedFields = {};
        if (username) updatedFields.username = username;
        if (bio) updatedFields.bio = bio;
        if (profilePic && profilePic.startsWith('data:')) {
            const uploadResponse = await cloudinary.uploader.upload(profilePic);
            updatedFields.profilePic = uploadResponse.secure_url;
        }

        console.log("Fields being sent to MongoDB:", updatedFields);

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updatedFields },
            { new: true }
        ).select('-password');

        // DEBUG 2: Let's see what Mongoose returns
        console.log("Mongoose returned this user:", updatedUser);

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.status(200).json({ 
            message: "Profile updated successfully!",
            user: updatedUser 
        });

    } catch (error) {
        // DEBUG 3: Log the FULL error object, not just the message
        console.error("FULL ERROR in updateProfile controller: ", error);
        
        // This specifically checks for a duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({ message: "Username already exists. Please choose another." });
        }
        
        res.status(500).json({ message: "Server error" });
    }
};

export const checkAuth=(req,res)=>{
    try{
        res.status(200).json({user:req.user});
    }
    catch(error){
        res.status(500).json({message:"Server error"});
    }
}