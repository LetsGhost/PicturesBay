import { Server } from 'socket.io';
import passport from 'passport';

import "./events/connection.event";
import { JoinEvent } from './events/connection.event';
import { RoomEvent } from './events/room.event';

export const registerSocketEvents = (io: Server) => {

  io.engine.use(
    (req: { _query: Record<string, string> }, res: Response, next: Function) => {
      const isHandshake = req._query.sid === undefined;
      if (isHandshake) {
        passport.authenticate("jwt", { session: false })(req, res, next);
      } else {
        next();
      }
    },
  );

  console.log('Registering socket events');

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Add your event handlers here
    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);
    });

    // Import and register other events
    JoinEvent(socket);
    RoomEvent(socket);
  });
};