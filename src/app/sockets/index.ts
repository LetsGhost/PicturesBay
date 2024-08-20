import { Server } from 'socket.io';
import { Socket } from 'socket.io';

interface socket extends Socket {
  user?: any
  // other additional attributes here, example:
  // surname?: string;
}

const wrap = (middleware: (req: any, res: any, next: any) => void) => (socket: any, next: any) => middleware(socket.request, {}, next);

export const registerSocketEvents = (io: Server, sessionMiddleware: any, passport: any) => {
  console.log('Registering socket events');

  io.use(wrap(sessionMiddleware));
  io.use(wrap(passport.initialize()));
  io.use(wrap(passport.session()));

  io.use((socket, next) => {
    if (socket.request.user) {
      next();
    } else {
      next(new Error('unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Add your event handlers here
    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);
    });

    // Import and register other events
    //require('./events/userEvents')(socket);
  });
};