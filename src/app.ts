import express from 'express';
import { createServer } from 'http';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config();

import {connectToDatabase} from "./configs/db";

import userRouter from './app/routes/user.routes';

// Create Express server
const app = express();
const httpServer = createServer(app);

// Connect to database
connectToDatabase();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

// Routes
app.use(userRouter)

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});