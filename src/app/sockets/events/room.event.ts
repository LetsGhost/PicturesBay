// src/sockets/events/room.event.ts
import { Socket } from 'socket.io';

export const RoomEvent = (socket: Socket) => {
  socket.on("joinRoom", (room: string) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
    socket.emit("joinedRoom", `You joined room ${room}`);
  });

  socket.on("leaveRoom", (room: string) => {
    socket.leave(room);
    console.log(`User ${socket.id} left room ${room}`);
    socket.emit("leftRoom", `You left room ${room}`);
  });

  
};