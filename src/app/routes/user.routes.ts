import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

import userController from '../controllers/user.controller';

const UserRouter = express.Router();

UserRouter.post('/register', userController.createUser);

export default UserRouter;