import { Server } from 'socket.io';

import { authSocket } from '../middleware/authSocket.middleware';


export const registerSocketEvents = (io: Server) => {
  console.log('Registering socket events');

  io.use(authSocket)

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