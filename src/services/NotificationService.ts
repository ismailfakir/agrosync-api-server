import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { ServerToClientEvents, ClientToServerEvents } from '../types/types';

class NotificationService {
  private static instance: NotificationService;
  private io: Server<ClientToServerEvents, ServerToClientEvents> | undefined;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public init(httpServer: HttpServer) {
    console.log("initializating socket server");
    this.io = new Server(httpServer, {
      cors: {
        origin: "http://localhost:8080",
        methods: ["GET", "POST"]
      }
    });

    this.setupListeners();
    return this.io;
  }

  private setupListeners() {
    if (!this.io) return;

    this.io.on("connection", (socket: Socket) => {
      console.log(`Connected: ${socket.id}`);

      socket.on("join_room", (userId: string) => {
        console.log("User joined: "+userId);
        socket.join(userId);
      });

      socket.on("disconnect", () => {
        console.log("User disconnected");
      });
    });
  }

  // Helper method to send notifications from anywhere in the app
  public sendNotification(userId: string, message: string) {
    console.log("sending socket notification: "+userId +" "+message);
    if (!this.io) {
      throw new Error("Socket.io not initialized!");
    }
    this.io.to(userId).emit("notification", {
      message,
      timestamp: new Date()
    });
  }
}

export const notificationService = NotificationService.getInstance();