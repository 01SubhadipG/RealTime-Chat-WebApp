import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Optional for group messages
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group" }, // Optional for group messages
    text: { type: String },
    file: { type: String }, // Stores Cloudinary URL
    fileName: { type: String }, // Stores original name (e.g., "Invoice.pdf")
    messageType: { 
      type: String, 
      enum: ["text", "image", "file", "sticker"], 
      default: "text" 
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;