import { Request, Response } from 'express';

import UserService from '../services/user.service';

class UserController {
  async createUser(req: Request, res: Response) {
    const userData = req.body;

    const {success, code, message} = await UserService.createUser(userData)

    if(success){
      console.log('User created successfully');
    }

    return res.status(code).json({success, message});
  }
}

export default new UserController();