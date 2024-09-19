import Painting from "../models/painting.model";

export interface PaintingInterface {
  _id: Painting['_id'];
  name: string;
  level: string;
  painting: string;
  number: number;
  condition: number;
  createdAt: Date;
}