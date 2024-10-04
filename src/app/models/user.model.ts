import { prop, pre, Ref } from '@typegoose/typegoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import mongoose, { Document, Types } from 'mongoose';

import Inventory from './inventory.model';

dotenv.config();

@pre<User>('save', async function(next) {
    const user = this as User;
    if (!user.isModified('password')) {
      return next();
    }
    try {
      const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUNDS));
      user.password = await bcrypt.hash(user.password as string, salt);
      next();
    } catch (err) {
      next(err as mongoose.CallbackError);
    }
})

class User extends Document {

  constructor(email: string, username: string, birthdate: Date, password: string, createdAt: Date, privacyPolicy: boolean, inventory: Ref<Inventory>, _id: Types.ObjectId) {
    super();
    this.email = email;
    this.username = username;
    this.birthdate = birthdate;
    this.password = password;
    this.privacyPolicy = privacyPolicy;
    this.createdAt = createdAt;
    this.inventory = inventory;
    this._id = _id;
  }

  @prop({ required: true })
  public email: string;

  @prop({required: true})
  public username: string;

  @prop({ required: true })
  public birthdate: Date;

  @prop({ required: true })
  public password: string;

  @prop ({ required: true })
  public privacyPolicy: boolean;

  @prop({ required: true, default: Date.now })
  public createdAt: Date;

  @prop({ ref: () => Inventory })
  public inventory: Ref<Inventory>;

  public _id: Types.ObjectId
}

// Create and export the model
export default User;