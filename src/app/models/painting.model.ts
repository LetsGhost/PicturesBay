import { prop } from '@typegoose/typegoose';
import { Document } from 'mongoose';

class Painting extends Document {
  constructor(name: string, level: string, painting: string, claimed: boolean, createdAt: Date) {
    super();
    this.name = name;
    this.level = level;
    this.painting = painting;
    this.claimed = claimed;
    this.createdAt = createdAt;
  }

  @prop({ required: true })
  public name: string;

  @prop({ required: true })
  public level: string;

  @prop({ required: true })
  public painting: string;

  @prop({ required: true })
  public claimed: boolean;

  @prop({ required: true, default: Date.now })
  public createdAt: Date;
}