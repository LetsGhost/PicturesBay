import { Socket } from 'socket.io';

export const JoinEvent =  (socket: Socket) => {
  socket.on("join", () => {
    console.log("User joined room");
    socket.emit("joined", "You joined the room");
  })
};