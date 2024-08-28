import { ExtractJwt } from 'passport-jwt';
import dotenv from 'dotenv';
dotenv.config();

export const passportOpts = {
  session: false,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET!,
}