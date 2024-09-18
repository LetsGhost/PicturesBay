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
import RoomCreator from './app/helpers/roomCreator';

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
connectToRedis();

// Middlewares
app.use(cors({ origin: "*", credentials: true,  }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/user", userRouter)

registerSocketEvents(io);

const roomCreator = new RoomCreator(io);

// Create multiple rooms on server start
const roomsToCreate = ['room1', 'room2', 'room3', "room4", "room5", "room6", "room7", "room8", "room9", "room10"];
roomsToCreate.forEach(room => roomCreator.createRoom(room));

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});