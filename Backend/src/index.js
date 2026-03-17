import express from 'express';
import authRoutes from './routes/auth.routes.js';
import dotenv from 'dotenv';
import connectDB from './lib/db.js';
import cookieParser from 'cookie-parser';
import messageRoutes from './routes/message.routes.js';
import cors from 'cors';
import { app,server } from './lib/socket.js';
import groupRoutes from './routes/group.routes.js';


dotenv.config();

const payloadLimit = '50mb'; // Set your desired limit



app.use(express.json({ limit: payloadLimit }));
app.use(express.urlencoded({ extended: true, limit: payloadLimit }));
app.use(cookieParser());


app.use(cors({
    origin: [
    "https://realtime-chat-webapp-v84l.onrender.com", 
    "http://localhost:5173"
  ],
    credentials: true,
}));

app.use("/api/auth",authRoutes);
app.use("/api/messages",messageRoutes);

app.use("/api/groups", groupRoutes);
const port=process.env.PORT || 5000;


let retryCount = 0;
const MAX_RETRIES = 5;

const startServer = (p) => {
  // If we already have a successful connection, stop retrying
  if (server.listening) return;


  server.listen(p, "0.0.0.0",() => {
    console.log(`✅ Server is running on port ${p}`);
    connectDB();
    retryCount = 0; // Reset counter on success
  });
};

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    retryCount++;
    if (retryCount <= MAX_RETRIES) {
      console.log(`⚠️ Port ${port} is busy. Attempt ${retryCount}/${MAX_RETRIES}. Retrying in 5s...`);
      
      // CRITICAL: Close the current failed instance before retrying
      server.close(); 
      
      setTimeout(() => {
        startServer(port);
      }, 5000);
    } else {
      console.error(`❌ Max retries reached. Please kill the process on port ${port} manually.`);
      process.exit(1); // Stop the loop and let the developer intervene
    }
  } else {
    console.error("Critical server error:", err);
    process.exit(1);
  }
});

startServer(port);