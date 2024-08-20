import express, { Request, NextFunction } from 'express';
import { createServer } from 'http';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import passport from 'passport';
import session from 'express-session';
import { Server} from 'socket.io';
dotenv.config();

import {connectToDatabase} from "./configs/db";
import './configs/passportConfig';
import { registerSocketEvents } from './app/sockets';
import { client, connectToRedis } from './configs/redis';
import sessionMiddleware from './configs/session.config';

// Routes
import userRouter from './app/routes/user.routes';

// Create Express server
const app = express();
const httpServer = createServer(app);

// Connect to database
connectToDatabase();
connectToRedis();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

// Passport
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/user", userRouter)

// Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.use((socket, next) => {
  sessionMiddleware(socket.request as Request, {} as any, next as NextFunction);
});

io.use((socket, next) => {
  passport.initialize()(socket.request as Request, {} as any, next as NextFunction);
  passport.session()(socket.request as Request, {} as any, next as NextFunction);
});

registerSocketEvents(io);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});