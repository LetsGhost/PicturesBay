import { PaintingInterface } from './Painting.types';

export interface PaintingBet{
  paintingId: string;
  paintingName: string;
  lastBet: number;
  currentBet: number;
  currentBetUser: string;
  winner: {
    userId: string;
    username: string;
  }
}

export interface Room{
  name: string;
  timer: NodeJS.Timeout;
  interval: NodeJS.Timeout;
  users: Set<string>;
  oneMinuteInterval: NodeJS.Timeout;
  creationTime: number;
  paintings: PaintingInterface[];
  paintingBets: PaintingBet[];
}