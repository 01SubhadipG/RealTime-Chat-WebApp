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
    origin: 'http://localhost:5173',
    credentials: true,
}));

app.use("/api/auth",authRoutes);
app.use("/api/messages",messageRoutes);
app.use("/api/groups", groupRoutes);
const port=process.env.PORT || 5000;


server.listen(port, () => {
  console.log('Server is running on port '+port);
  connectDB();
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Please try again.`);
    process.exit(1);
  } else {
    throw err;
  }
});