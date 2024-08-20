import express from 'express';
import { createServer } from 'http';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import passport from 'passport';
import session from 'express-session';;
dotenv.config();

import {connectToDatabase} from "./configs/db";
import './configs/passportConfig';

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

// Passport
app.use(session({ 
  secret: process.env.SECRET_KEY as string, 
  resave: false, 
  saveUninitialized: true 
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/user", userRouter)

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});