import { getModelForClass } from "@typegoose/typegoose";

import User from "../models/user.model";

class UserService {
  async createUser(userData: User){
    try {
      const user = getModelForClass(User);
      user.create(userData);

      return {
        success: true,
        code: 201,
      }
    } catch (error) {
      console.error('Error creating user:', error);
      return {
        success: false,
        code: 500,
        message: 'Error creating user',
      }
    }
  }

  async findUserByEmail(email: string){
    try {
      const user = getModelForClass(User);
      const userFound = user.findOne({email});
      return {
        success: true,
        code: 200,
        user: userFound,
      }
    } catch (error) {
      console.error('Error finding user by email:', error);
      return {
        success: false,
        code: 500,
        message: 'Error finding user by email',
      }
    }
  }

  async validatePassword(password: string, userPassword: string){
    try{
      
    } catch (error) {
      console.error('Error validating password:', error);
      return {
        success: false,
        code: 500,
        message: 'Error validating password',
      }
    }
  }
}

export default new UserService();