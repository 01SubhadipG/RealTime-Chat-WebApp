import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

// Helper to store online users: { userId: [socketId1, socketId2] }
const userSocketMap = {}; 

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

const io = new Server(server, {
  cors: {
    // FIX: Allow both Local and Production URLs to avoid "Finished" status
    origin: [
      "http://localhost:5173", 
      "https://realtime-chat-webapp-v84l.onrender.com",
      "https://your-frontend-deployment-url.netlify.app" // Add your actual frontend URL here
    ],
    credentials: true
  },
  // Force WebSockets for stability on Render's infrastructure
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  // No. 3 Fix: Handle missing or "undefined" string userId
  if (!userId || userId === "undefined" || userId === "null") {
    console.log("Connection rejected: No valid userId provided.");
    return socket.disconnect(); 
  }

  console.log(`User connected: ${userId} (Socket: ${socket.id})`);

  // Map the user (Supports multiple tabs/devices)
  if (!userSocketMap[userId]) {
    userSocketMap[userId] = [];
  }
  userSocketMap[userId].push(socket.id);

  // Notify everyone who is online
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${userId}`);
    if (userSocketMap[userId]) {
      // Remove only this specific socket ID
      userSocketMap[userId] = userSocketMap[userId].filter((id) => id !== socket.id);
      
      // If no more tabs open for this user, remove them from the map
      if (userSocketMap[userId].length === 0) {
        delete userSocketMap[userId];
      }
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Port configuration for Render
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export { io, app, server };