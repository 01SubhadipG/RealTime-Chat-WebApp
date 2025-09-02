import express from 'express';
import authRoutes from './routes/auth.routes.js';
import dotenv from 'dotenv';
import connectDB from './lib/db.js';
import cookieParser from 'cookie-parser';
import messageRoutes from './routes/message.routes.js';
import cors from 'cors';

dotenv.config();

const app=express();

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
const port=process.env.PORT;


app.listen(port, () => {
  console.log('Server is running on port '+port);
  connectDB();
});