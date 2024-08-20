import { Request, Response } from 'express';
import passport from 'passport';

import UserService from '../services/user.service';

class UserController {
  async createUser(req: Request, res: Response) {
    const userData = req.body;

    const {success, code, message} = await UserService.createUser(userData)

    if(success){
      console.log('User created successfully');
    } else {
      console.error('Error creating user:', message);
    }

    return res.status(code).json({success, message});
  }

  async loginUser(req: Request, res: Response, next: Function) {
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.status(200).json({ success: true, message: 'Logged in successfully' });
      });
    })(req, res, next);
  }

  async guardedRoute(req: Request, res: Response) {
    console.log('User is authenticated');
    return res.status(200).json({ success: true, message: 'You are authenticated' });
  }
}

export default new UserController();