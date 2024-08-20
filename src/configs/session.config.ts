import session from 'express-session';
import dotenv from 'dotenv';
dotenv.config();

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET as string,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
});

export default sessionMiddleware;