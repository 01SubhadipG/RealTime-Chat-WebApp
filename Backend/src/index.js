import express from 'express';
import authRoutes from './routes/auth.routes.js';
import dotenv from 'dotenv';
import connectDB from './lib/db.js';
import cookieParser from 'cookie-parser';
import messageRoutes from './routes/message.routes.js';
import cors from 'cors';
import { app, server } from './lib/socket.js'; // server is the http instance
import groupRoutes from './routes/group.routes.js';
import path from "path"; // Added for production pathing

dotenv.config();

const port = process.env.PORT || 5000;
const payloadLimit = '50mb';

// 1. Middleware
app.use(express.json({ limit: payloadLimit }));
app.use(express.urlencoded({ extended: true, limit: payloadLimit }));
app.use(cookieParser());

// 2. CORS - Ensure no trailing slashes
app.use(cors({
  origin: [
    "https://realtime-chat-webapp-v84l.onrender.com", 
    "http://localhost:5173"
  ],
  credentials: true,
}));

// 3. Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/groups", groupRoutes);

// 4. Deployment logic (Optional but recommended)
if (process.env.NODE_ENV === "production") {
  const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

// 5. THE STARTUP LOGIC (Simplified for Render)
// REMOVE the retry logic. Render handles restarts automatically.
server.listen(port, "0.0.0.0", () => {
  console.log(`✅ Server is running on port ${port}`);
  connectDB();
});