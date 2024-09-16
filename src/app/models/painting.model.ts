import { prop } from '@typegoose/typegoose';
import { Document } from 'mongoose';

class Painting extends Document {
  constructor(name: string, level: string, painting: string, createdAt: Date, number: number, condition: number) {
    super();
    this.name = name;
    this.level = level;
    this.painting = painting;
    this.number = number;
    this.createdAt = createdAt;
    this.condition = condition
  }

  @prop({ required: true })
  public name: string;

  @prop({ required: true })
  public level: string;

  @prop({ required: true })
  public painting: string;

  @prop({ required: true, })
  public number: number;

  @prop({ required: true })
  public condition: number

  @prop({ required: true, default: Date.now })
  public createdAt: Date;
}

export default Painting