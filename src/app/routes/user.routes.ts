import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

import userController from '../controllers/user.controller';

// Import Middleware
import {authMiddleware}  from '../middleware/auth.middleware';

const UserRouter = express.Router();

UserRouter.post('/register', userController.createUser);
UserRouter.post('/login', userController.loginUser);
UserRouter.get('/guarded', authMiddleware, userController.guardedRoute);

export default UserRouter;