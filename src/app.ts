import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import passport from 'passport';
import { Server} from 'socket.io';
dotenv.config();

import {connectToDatabase} from "./configs/db";
import './configs/passport.config';
import { registerSocketEvents } from './app/sockets';
import { connectToRedis } from './configs/redis';

// Routes
import userRouter from './app/routes/user.routes';

// Create Express server
export const app = express(); // Export for tests
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    credentials: true
  }
});

// Connect to database
connectToDatabase();
//connectToRedis();

// Middlewares
app.use(cors({ origin: "*", credentials: true,  }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/user", userRouter)

registerSocketEvents(io);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});