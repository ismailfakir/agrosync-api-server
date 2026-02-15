import express from "express";
import morgan from "morgan";
import logger from "./utils/logger";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { connectDB } from "./config/db";
import { generateOpenAPIDocs } from "./utils/openapi";
import { errorHandler } from "./middlewares/error.middleware";
import { requestLogger } from "./middlewares/logger.middleware";
import { ApiError } from "./utils/apiError";
import os from "os";

// Import Routes
import deviceRoutes from "./controllers/device.controller";
import deviceCommandRoutes from "./controllers/deviceCommand.controller";
import userRoutes from "./controllers/user.controller";
import authRoutes from "./controllers/auth.controller"; // (Implement similar to device)
import sensorRoutes from "./controllers/sensordata.controller";
import mqttRoutes from "./controllers/mqtt.controller";
import { mqttService } from "./services/MqttService";
import { SensorDataService } from "./services/sensorData.service";

import { v4 as uuidv4 } from "uuid";

import dotenv from 'dotenv';

dotenv.config();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8880'

const app = express();

// Connect DB
connectDB();

// Middleware
const corsOptions = {
  origin: FRONTEND_URL, // Match your frontend's address
  methods: ["GET", "POST", "PUT", "DELETE"], // Specify the allowed HTTP methods
};
app.use(cors(corsOptions));

// 1. Parse JSON first
app.use(express.json());
// 2. Use your custom logger
app.use(requestLogger);

// For parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/devices/command", deviceCommandRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/sensor", sensorRoutes);
app.use("/api/trigger-alarm", mqttRoutes);

// OpenAPI / Swagger
const openApiDocs = generateOpenAPIDocs();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocs));
app.get("/api-docs.json", (req, res) => {
  res.json(openApiDocs);
});

// Morgan HTTP Logging
// We create a stream for Morgan to write to Winston
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  }),
);

// Example usage in a route or error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    logger.error(
      `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`,
    );
    res.status(err.status || 500).json({ message: err.message });
  },
);

// Handle 404 (Route not found)
app.use((req, res, next) => {
  next(new ApiError(404, "Route not found"));
});

// The error handler must be the LAST middleware
app.use(errorHandler);

//MQTT
const topic = "/agrosync/sensordata";
const topic_command = "/agrosync/command";
// Handler 1: Specific topic
mqttService.on(topic, (data) => {
  console.log("✅ Received sensor data:", data);

  //SensorDataService.recordMqttData(data);
  //console.log('✅ data saved to DB:');
});

// Handler 2: Wildcard (matches home/kitchen/temp, home/bedroom/temp, etc.)
mqttService.on("home/+/temp", (data, topic) => {
  const room = topic.split("/")[1];
  console.log(`Temperature in ${room} is ${data.value}°C`);
});

// Handler 3: Multi-level wildcard (matches everything under 'logs')
mqttService.on("logs/#", (data, topic) => {
  console.log(`[LOG SYSTEM - ${topic}]:`, data);
});

// Send a heartbeat every 60 seconds to /agrosync/servers/status
setInterval(() => {
  let myuuid = uuidv4();
  const heartbeat = {
    id: myuuid,
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage().heapUsed,
    load: os.loadavg()[0],
    status: "online",
  };
  console.log("server alive!");
  //mqttService.publish('/agrosync/servers/status', heartbeat);
}, 60000);

export default app;
