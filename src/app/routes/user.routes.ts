import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

import userController from '../controllers/user.controller';

// Import Middleware
import { isAuthenticated } from '../middleware/auth.middleware';

const UserRouter = express.Router();

UserRouter.post('/register', userController.createUser);
UserRouter.post('/login', userController.loginUser);
UserRouter.get('/guarded', isAuthenticated, userController.guardedRoute);

export default UserRouter;