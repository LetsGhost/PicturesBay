import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import logger from "../../configs/winston.config";
dotenv.config();

import UserService from '../services/user.service';

class UserController {
  async createUser(req: Request, res: Response) {
    try{
      const userData = req.body;

      const {success, code, message} = await UserService.createUser(userData)

      if(success){
        logger.info('User created successfully', { service: "UserController.createUser"});
      } else {
        logger.error('Error creating user:', message, { service: "UserController.createUser"});
      }

      return res.status(code).json({success, message});
    } catch (error) {
      logger.error('Error creating user:', error, { service: "UserController.createUser"});
      res.status(500).json({success: false, message: 'Internal server error'});
    }
  }

  async loginUser(req: Request, res: Response, next: Function) {
    try{
      const { email, password, rememberMe } = req.body;

      // Check if User exists
      const user = await UserService.findUserByEmail(email);
      if(!user.success){
        return res.status(user.code).json({success: false, message: user.message});
      }

      // Validate password
      const validPassword = await UserService.validatePassword(password, user.user?.password!);
      if(!validPassword){
        return res.status(401).json({success: false, message: 'Invalid password'});
      }

      const expiresIn = rememberMe ? process.env.JWT_EXPIRATION_REMEMBER_ME! : process.env.JWT_EXPIRATION!;

      // Create JWT token
      const token = jwt.sign({id: user.user?._id}, process.env.JWT_SECRET!, {expiresIn});

      logger.info('User logged in successfully', { service: "UserController.loginUser"});

      return res.status(200).json({success: true, token});
    } catch (error) {
      logger.error('Error logging in user:', error, { service: "UserController.loginUser"});
      res.status(500).json({success: false, message: 'Internal server error'});
    }
  }

  async guardedRoute(req: Request, res: Response) {
    console.log('User is authenticated');
    return res.status(200).json({ success: true, message: 'You are authenticated' });
  }
}

export default new UserController();