import { Server } from 'socket.io';

export const registerSocketEvents = (io: Server) => {
  console.log('Registering socket events');

  io.use((socket, next) => {
    const req = socket.request as any;

    if(req.isAuthenticated()){
      return next();
    }
    next(new Error('Unauthorized'));
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Add your event handlers here
    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);
    });

    // Import and register other events
    require('./events/userEvents')(socket);
  });
};