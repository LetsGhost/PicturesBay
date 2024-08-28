import { Socket } from 'socket.io';
import { IncomingMessage } from 'http';
import passport from 'passport';
import sessionMiddleware from '../../configs/session.config';

export const authSocket = (socket: Socket, next: (err?: any) => void) => {
  const req = socket.request as IncomingMessage & { session: any, user: any } as any;

  sessionMiddleware(req, {} as any, () => {
    passport.initialize()(req, {} as any, () => {
      passport.session()(req, {} as any, () => {
        if (req.user) {
          next();
        } else {
          next(new Error('Unauthorized'));
        }
      });
    });
  });
};