import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    // Replace with your actual frontend Render URL
    origin: process.env.NODE_ENV === "production" 
      ? "https://realtime-chat-webapp-v84l.onrender.com" 
      : "http://localhost:5173", 
    credentials: true
  },
  // Ensure websocket is the primary transport
  transports: ['websocket', 'polling'],
  allowEIO3: true // Helps with compatibility if versions differ slightly
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: [socketId1, socketId2, ...]}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) {
    if (!userSocketMap[userId]) {
      userSocketMap[userId] = [];
    }
    userSocketMap[userId].push(socket.id);
  }

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    if (userId && userSocketMap[userId]) {
      userSocketMap[userId] = userSocketMap[userId].filter(
        (id) => id !== socket.id
      );
      if (userSocketMap[userId].length === 0) {
        delete userSocketMap[userId];
      }
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Handle server errors (e.g., port already in use)
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port is already in use. Waiting 5 seconds before retrying...`);
    setTimeout(() => {
      server.close();
      server.listen(process.env.PORT || 5000);
    }, 5000);
  } else {
    throw err;
  }
});

// Graceful shutdown handling
const gracefulShutdown = () => {
  console.log('Shutting down gracefully...');
  io.on('connection', (socket) => {
    socket.disconnect(true);
  });
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
  
  // Force close after 10 seconds if not closed
  setTimeout(() => {
    console.error('Forcing shutdown');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export { io, app, server };