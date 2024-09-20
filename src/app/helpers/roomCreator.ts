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

      socket.on("bet", (roomName: string, paintingId: string, betAmount: number, userId: string, username: string) => {
        this.bet(roomName, paintingId, betAmount, userId, username);
      });

      socket.on('leaveRoom', (roomName: string) => {
        this.leaveRoom(socket, roomName);
      });

      // Emit room list when a client connects
      socket.emit('roomsList', this.getRooms());
    });
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
      oneMinuteStartTime: 0, 
      creationTime: Date.now(), 
      paintings: queryPaintings.paintings ?? [], 
      paintingBets: paintingBetsInit ?? [],
      currentPainting: queryPaintings.paintings?.[0] ?? {}
    });
    console.log(`Room ${name} created with a ${duration / 1000 / 60} minute timer.`);


    // Start the 1-minute timer logic
    this.startOneMinuteTimer(name);
    this.io.emit('roomsList', this.getRooms());
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
          paintingBet.currentBetUser = username;
          this.io.to(roomName).emit("paintingBetUpdate", paintingBet);
        }
      }
    }
  }

  startOneMinuteTimer(roomName: string) {
    const oneMinute = 60 * 1000;
    let remainingOneMinuteTime = oneMinute;
    const oneMinuteStartTime = Date.now();

    const oneMinuteInterval = setInterval(() => {
      remainingOneMinuteTime -= 1000;

      if (remainingOneMinuteTime <= 0) {
        remainingOneMinuteTime = oneMinute;
        
        // Logic when a painting bet round ended
        this.roundEnd(roomName);
        this.io.to(roomName).emit("oneMinuteTimerEnd", true);
      }
    }, 1000);

    // Store the interval so it can be cleared later if needed
    const room = this.rooms.get(roomName);
    if (room) {
      room.oneMinuteInterval = oneMinuteInterval;
      room.oneMinuteStartTime = oneMinuteStartTime;
    }
  }

  roundEnd(roomName: string){
    const room = this.rooms.get(roomName);
    if (room) {
      // Logic when a painting bet round ended
      const paintingBets = room.paintingBets;
      const currentPainting = room.currentPainting;

      // Find the winner of the painting bet
      const winnerPaintingBet = paintingBets.reduce((prev, current) => (prev.currentBet > current.currentBet) ? prev : current);
      const winnerPaintingBetIndex = paintingBets.findIndex(p => p.paintingId === winnerPaintingBet.paintingId);

      // Update the winner of the painting bet
      paintingBets[winnerPaintingBetIndex].winner = {
        userId: winnerPaintingBet.currentBetUser,
        username: winnerPaintingBet.currentBetUser
      }

      // Update the current painting
      const nextPaintingIndex = room.paintings.findIndex(p => p._id === currentPainting._id) + 1;
      room.currentPainting = room.paintings[nextPaintingIndex] ?? room.paintings[0];

      // Emit the Winner of the painting bet
      this.io.to(roomName).emit("paintingBetWinner", paintingBets[winnerPaintingBetIndex]);

      // Wait 10 secs before a new round starts
      setTimeout(() => {
        // Emit the paintingBets and currentPainting to the room
        this.io.to(roomName).emit("paintingBets", paintingBets);
        this.io.to(roomName).emit("painting", room.currentPainting);
      }, 10000);
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
    
    // Emit the oneMinuteTimerUpdate
    const elapsedOneMinuteTime = Date.now() - room.oneMinuteStartTime;
    const remainingOneMinuteTime = Math.max(0, 60 * 1000 - elapsedOneMinuteTime);

    room.oneMinuteStartTime = remainingOneMinuteTime;
    socket.emit("room", {
      roomName: room.name,
      users: Array.from(room.users),
      remainingTime: this.calculateRemainingTime(roomName),
      oneMinuteTimer: remainingOneMinuteTime / 1000,
      paintingBets: room.paintingBets,
      painting: room.currentPainting,
    });
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

  getRoom(roomName: string) {
    this.io.to(roomName).emit("room", this.rooms.get(roomName));
  }
}

export default RoomCreator;