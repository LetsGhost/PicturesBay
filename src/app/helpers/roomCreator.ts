// src/helpers/roomCreator.ts
import { Server, Socket } from 'socket.io';

interface Room {
  name: string;
  timer: NodeJS.Timeout;
  interval: NodeJS.Timeout;
  users: Set<string>;
  oneMinuteInterval: NodeJS.Timeout;
}

class RoomCreator {
  private io: Server;
  private rooms: Map<string, Room>;

  constructor(io: Server) {
    this.io = io;
    this.rooms = new Map();

    this.io.on('connection', (socket: Socket) => {
      socket.on('joinRoom', (roomName: string) => {
        this.joinRoom(socket, roomName);
      });

      socket.on('leaveRoom', (roomName: string) => {
        this.leaveRoom(socket, roomName);
      });
    });
  }

  createRoom(name: string, duration: number = 5 * 60 * 1000) {
    if (this.rooms.has(name)) {
      console.log(`Room ${name} already exists.`);
      return;
    }

    const users = new Set<string>();
    let remainingTime = duration;

    const interval = setInterval(() => {
      remainingTime -= 1000;
      this.io.to(name).emit("timerUpdate", `Time remaining for room ${name}: ${remainingTime / 1000} seconds`);
    }, 1000);

    const timer = setTimeout(() => {
      this.io.to(name).emit("timerEnd", `Timer ended for room ${name}`);
      console.log(`Timer ended for room ${name}`);
      clearInterval(interval);
      clearInterval(oneMinuteInterval);
      this.disconnectUsersFromRoom(name);
      this.rooms.delete(name);
      this.createRoom(name, duration); // Create a new room after the current one ends
    }, duration);

    // Initialize oneInterval with a dummy timeout
    const oneMinuteInterval = setTimeout(() => {}, 0);

    this.rooms.set(name, { name, timer, interval, users, oneMinuteInterval });
    console.log(`Room ${name} created with a ${duration / 1000 / 60} minute timer.`);

    // Start the 1-minute timer logic
    this.startOneMinuteTimer(name);
  }

  startOneMinuteTimer(roomName: string) {
    const oneMinute = 60 * 1000;
    let remainingOneMinuteTime = oneMinute;

    const oneMinuteInterval = setInterval(() => {
      remainingOneMinuteTime -= 1000;
      this.io.to(roomName).emit("oneMinuteTimerUpdate", `1-minute timer remaining time for room ${roomName}: ${remainingOneMinuteTime / 1000} seconds`);

      if (remainingOneMinuteTime <= 0) {
        remainingOneMinuteTime = oneMinute;
        this.io.to(roomName).emit("oneMinuteTimerEnd", `1-minute timer ended for room ${roomName}`);
        // Add your custom logic here for what should happen every minute
      }
    }, 1000);

    // Store the interval so it can be cleared later if needed
    const room = this.rooms.get(roomName);
    if (room) {
      room.oneMinuteInterval = oneMinuteInterval;
    }
  }

  joinRoom(socket: Socket, roomName: string) {
    if (!this.rooms.has(roomName)) {
      console.log(`Room ${roomName} does not exist.`);
      return;
    }

    const room = this.rooms.get(roomName)!;
    room.users.add(socket.id);
    socket.join(roomName);
    this.io.to(roomName).emit("userUpdate", Array.from(room.users));
    console.log(`User ${socket.id} joined room ${roomName}`);
  }

  leaveRoom(socket: Socket, roomName: string) {
    if (!this.rooms.has(roomName)) {
      console.log(`Room ${roomName} does not exist.`);
      return;
    }

    const room = this.rooms.get(roomName)!;
    room.users.delete(socket.id);
    socket.leave(roomName);
    this.io.to(roomName).emit("userUpdate", Array.from(room.users));
    console.log(`User ${socket.id} left room ${roomName}`);
  }

  disconnectUsersFromRoom(roomName: string) {
    const room = this.rooms.get(roomName);
    if (room) {
      room.users.forEach(userId => {
        const socket = this.io.sockets.sockets.get(userId);
        if (socket) {
          socket.leave(roomName);
        }
      });
      room.users.clear();
      this.io.to(roomName).emit("userUpdate", []);
      console.log(`All users disconnected from room ${roomName}`);
    }
  }

  getRooms() {
    return Array.from(this.rooms.keys());
  }
}

export default RoomCreator;