// src/helpers/roomCreator.ts
import { Server } from 'socket.io';

interface Room {
  name: string;
  timer: NodeJS.Timeout;
}

class RoomCreator {
  private io: Server;
  private rooms: Map<string, Room>;

  constructor(io: Server) {
    this.io = io;
    this.rooms = new Map();
  }

  createRoom(name: string, duration: number = 5 * 60 * 1000) {
    if (this.rooms.has(name)) {
      console.log(`Room ${name} already exists.`);
      return;
    }

    const timer = setTimeout(() => {
      this.io.to(name).emit("timerEnd", `Timer ended for room ${name}`);
      console.log(`Timer ended for room ${name}`);
      this.rooms.delete(name);
    }, duration);

    this.rooms.set(name, { name, timer });
    console.log(`Room ${name} created with a ${duration / 1000 / 60} minute timer.`);
  }

  getRooms() {
    return Array.from(this.rooms.keys());
  }
}

export default RoomCreator;