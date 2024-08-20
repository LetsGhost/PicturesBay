import { getModelForClass } from "@typegoose/typegoose";
import bcrypt from "bcrypt";

import User from "../models/user.model";

const UserModel = getModelForClass(User);

class UserService {
  async createUser(userData: User){
    try {
      // Ensure email is defined
      if (!userData.email) {
        return {
          success: false,
          code: 400,
          message: 'Email is required',
        };
      }

      // Ensure password is defined
      if (!userData.password) {
        return {
          success: false,
          code: 400,
          message: 'Password is required',
        };
      }

      // Check if user already exists
      const userExists = await this.findUserByEmail(userData.email);
      if(!userExists.success){
        return {
          success: false,
          code: 409,
          message: 'User already exists',
        }
      }
      
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
      // Check if email is defined
      if (!email) {
        return {
          success: false,
          code: 400,
          message: 'Email is required',
        };
      }


      const userFound = await UserModel.findOne({email: email}).exec();

      if(!userFound){
        return {
          success: false,
          code: 404,
          message: 'User not found',
        }
      }

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
        user: null
      }
    }
  }

  async findUserById(id: string){
    try{
      // Check if id is defined
      if (!id) {
        return {
          success: false,
          code: 400,
          message: 'Id is required',
        };
      }

      const user = getModelForClass(User);
      const userFound = user.findById(id);

      if(!userFound){
        return {
          success: false,
          code: 404,
          message: 'User not found',
        }
      }

      return {
        success: true,
        code: 200,
        user: userFound,
      }
    } catch (error) {
      console.error('Error finding user by id:', error);
      return {
        success: false,
        code: 500,
        message: 'Error finding user by id',
      }
    }
  }

  async validatePassword(password: string, userPassword: string){
    try{
      const isMatch = await bcrypt.compare(password, userPassword);
      if(!isMatch){
        return {
          success: false,
          code: 401,
          message: 'Incorrect password',
        }
      }

      return {
        success: true,
        code: 200,
      }
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