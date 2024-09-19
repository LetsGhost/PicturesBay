import { Server, Socket } from 'socket.io';
import { PaintingBet, Room } from '../types/Room.types';
import { PaintingInterface } from '../types/Painting.types';
import paintingService from '../services/painting.service';

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

      // Emit room list when a client connects
      socket.emit('roomsList', this.getRooms());
    });

    this.startRoomTimer(); // Ensure the timer starts when the instance is created
  }

  async createRoom(name: string, duration: number = 5 * 60 * 1000) {
    if (this.rooms.has(name)) {
      console.log(`Room ${name} already exists.`);
      return;
    }

    // Query Paintings before creating a room
    const queryPaintings = await paintingService.getPaintingWithLevel("common")
    if(!queryPaintings.success){
      console.log("No paintings found")
      return
    }

    const paintingBetsInit = queryPaintings?.paintings?.map((painting: PaintingInterface) => ({
      paintingId: String(painting._id),
      paintingName: painting.name,
      lastBet: 0,
      currentBet: 0,
      currentBetUser: "",
      winner: {
        userId: "",
        username: ""
      }
    }));

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
      this.io.to(name).emit("leaveRoom", { leaveRoom: true}) // Emit an event to leave the room
      this.rooms.delete(name);
      this.createRoom(name, duration); // Create a new room after the current one ends
    }, duration);

    // Initialize oneInterval with a dummy timeout
    const oneMinuteInterval = setTimeout(() => {}, 0);

    this.rooms.set(name, { 
      name, 
      timer, 
      interval, 
      users, 
      oneMinuteInterval, 
      creationTime: Date.now(), 
      paintings: queryPaintings.paintings ?? [], 
      paintingBets: paintingBetsInit ?? []
    });
    console.log(`Room ${name} created with a ${duration / 1000 / 60} minute timer.`);

    // Start the 1-minute timer logic
    this.startOneMinuteTimer(name);
  }

  getPaintings(roomName: string) {
    const room = this.rooms.get(roomName);
    if (room) {
      return room.paintings;
    }
    return [];
  }

  bet(roomName: string, paintingId: string, betAmount: number, userId: string, username: string) {
    const room = this.rooms.get(roomName);
    if (room) {
      const paintingBet = room.paintingBets.find(p => p.paintingId === paintingId);
      if (paintingBet) {
        if (betAmount > paintingBet.currentBet) {
          paintingBet.currentBet = betAmount;
          paintingBet.currentBetUser = userId;
          this.io.to(roomName).emit("paintingBetUpdate", paintingBet);
        }
      }
    }
  }

  startOneMinuteTimer(roomName: string) {
    const oneMinute = 60 * 1000;
    let remainingOneMinuteTime = oneMinute;

    const oneMinuteInterval = setInterval(() => {
      remainingOneMinuteTime -= 1000;
      this.io.to(roomName).emit("oneMinuteTimerUpdate", `1-minute timer remaining time for room ${roomName}: ${remainingOneMinuteTime / 1000} seconds`);

      // Logic when one minute starts

      if (remainingOneMinuteTime <= 0) {
        remainingOneMinuteTime = oneMinute;
        this.io.to(roomName).emit("oneMinuteTimerEnd", `1-minute timer ended for room ${roomName}`);
        
        // Logic when a painting bet round ended

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
    this.io.to(roomName).emit("paintings", room.paintings);
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

  // Method to calculate remaining time for each room
  calculateRemainingTime(roomName: string): number {
    const room = this.rooms.get(roomName);
    if (room) {
      const currentTime = Date.now();
      const elapsedTime = (currentTime - room.creationTime) / 1000; // in seconds
      const remainingTime = Math.max(0, 300 - elapsedTime); // 300 seconds = 5 minutes
      return remainingTime;
    }
    return 0;
  }

  // Method to get a list of rooms with their users and remaining time
  getRooms() {
    const roomsList = Array.from(this.rooms.entries()).map(([roomName, room]) => ({
      roomName,
      users: Array.from(room.users),
      remainingTime: this.calculateRemainingTime(roomName)
    }));
    
    return roomsList;
  }

  // Emit the list of rooms to all clients that are not in a room
  emitRoomsList() {
    const roomsList = this.getRooms();
    this.io.sockets.sockets.forEach(socket => {
      let isInRoom = false;
      this.rooms.forEach(room => {
        if (room.users.has(socket.id)) {
          isInRoom = true;
        }
      });
      if (!isInRoom) {
        socket.emit("roomsList", roomsList);
      }
    });
  }

  getRoom(roomName: string) {
    this.io.to(roomName).emit("room", this.rooms.get(roomName));
  }

  // Method to start a timer that emits the list of rooms every second
  startRoomTimer() {
    setInterval(() => {
      this.emitRoomsList();
    }, 1000); // Emit every second
  }
}

export default RoomCreator;