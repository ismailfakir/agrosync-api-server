"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const express = require("express");
const morgan = require("morgan");
const winston = require("winston");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const mongoose = require("mongoose");
const zodToOpenapi = require("@asteasolutions/zod-to-openapi");
const zod = require("zod");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const dotenv = require("dotenv");
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    // Write all logs to combined.log
    new winston.transports.File({ filename: "logs/combined.log" })
  ]
});
if (process.env.NODE_ENV !== "production") {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/agrosync");
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};
const registry = new zodToOpenapi.OpenAPIRegistry();
const generateOpenAPIDocs = () => {
  const generator = new zodToOpenapi.OpenApiGeneratorV3(registry.definitions);
  const doc = generator.generateDocument({
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "IoT Management API",
      description: "API for managing IoT devices and users"
    },
    servers: [{ url: "http://localhost:3000/api" }]
  });
  return doc;
};
registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT"
});
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
const errorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = "Internal Server Error";
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.name === "ValidationError") {
    statusCode = 400;
    message = err.message;
  }
  logger.error(`${statusCode} - ${err.message} - ${req.originalUrl} - ${req.method}`);
  const response = {
    status: "error",
    statusCode,
    message,
    ...process.env.NODE_ENV === "development" && { stack: err.stack }
  };
  res.status(statusCode).json(response);
};
const DeviceSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: false },
  location: { type: String, required: false, unique: false },
  type: { type: String, required: true },
  status: {
    type: String,
    enum: ["online", "offline", "maintenance"],
    default: "offline"
  },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });
const DeviceModel = mongoose.model("Device", DeviceSchema);
const DeviceService = {
  async create(data, userId) {
    try {
      const device = await DeviceModel.create({
        ...data,
        status: "offline",
        owner: userId
      });
      console.log("✅ Device created");
      return device;
    } catch (error) {
      console.error("❌ Saving device failed:", error);
    }
  },
  async findAll(userId, role) {
    const query = role === "admin" ? {} : { owner: userId };
    return await DeviceModel.find(query).populate("owner", "name email");
  },
  async findById(id) {
    return await DeviceModel.findById(id);
  },
  async update(id, data) {
    return await DeviceModel.findByIdAndUpdate(id, data, { new: true });
  },
  async delete(id) {
    return await DeviceModel.findByIdAndDelete(id);
  }
};
zodToOpenapi.extendZodWithOpenApi(zod.z);
const CreateDeviceSchema = registry.register("CreateDeviceRequest", zod.z.object({
  name: zod.z.string().min(3),
  location: zod.z.string().min(3),
  type: zod.z.string(),
  status: zod.z.enum(["online", "offline", "maintenance"]).optional()
}));
registry.register("DeviceResponse", zod.z.object({
  id: zod.z.string(),
  name: zod.z.string(),
  location: zod.z.string(),
  type: zod.z.string(),
  status: zod.z.string(),
  owner: zod.z.string(),
  // User ID
  createdAt: zod.z.date().optional()
}));
const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof zod.ZodError) {
      return res.status(400).json({ errors: error });
    }
    next(error);
  }
};
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};
const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles.some((r) => roles.includes(r))) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
};
const router$3 = express.Router();
registry.registerPath({
  method: "post",
  path: "/devices",
  summary: "Create a new IoT Device",
  tags: ["Devices"],
  security: [{ bearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: CreateDeviceSchema } } }
  },
  responses: {
    201: { description: "Device created successfully" },
    400: { description: "Validation Error" }
  }
});
router$3.post(
  "/",
  authenticate,
  validate(CreateDeviceSchema),
  async (req, res) => {
    try {
      console.log("creating device: " + req.body);
      console.log("user id: " + req.user.id);
      const device = await DeviceService.create(req.body, req.user.id);
      res.status(201).json(device);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);
registry.registerPath({
  method: "get",
  path: "/devices",
  summary: "Get all devices",
  tags: ["Devices"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: { description: "List of devices" }
  }
});
router$3.get("/", authenticate, async (req, res) => {
  const devices = await DeviceService.findAll(req.user.id, req.user.roles[0]);
  if (!devices) {
    throw new ApiError(404, "Device not found");
  }
  res.json(devices);
});
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  // Don't return password by default
  name: { type: String, required: true },
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role" }],
  passwordResetToken: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false }
}, { timestamps: true });
const UserModel = mongoose.model("User", UserSchema);
const UserService = {
  async findAll() {
    return await UserModel.find().populate("roles");
  },
  async findById(id) {
    const user = await UserModel.findById(id).populate("roles");
    if (!user) throw new Error("User not found");
    return user;
  },
  async updateProfile(id, data) {
    return await UserModel.findByIdAndUpdate(id, data, { new: true });
  },
  async assignRole(userId, roleId) {
    return await UserModel.findByIdAndUpdate(
      userId,
      { $addToSet: { roles: roleId } },
      // Prevents duplicate roles
      { new: true }
    );
  },
  async deleteUser(id) {
    return await UserModel.findByIdAndDelete(id);
  }
};
const router$2 = express.Router();
registry.registerPath({
  method: "get",
  path: "/users/me",
  summary: "Get current user profile",
  tags: ["Users"],
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: "User data" } }
});
router$2.get("/me", authenticate, async (req, res) => {
  const user = await UserService.findById(req.user.id);
  res.json(user);
});
router$2.get("/", authenticate, authorize(["admin"]), async (req, res) => {
  const users = await UserService.findAll();
  res.json(users);
});
const RoleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  permissions: [{ type: String }]
});
const RoleModel = mongoose.model("Role", RoleSchema);
const AuthService = {
  /**
   * Registers a new user and assigns the default 'user' role.
   */
  async register(data) {
    const existingUser = await UserModel.findOne({ email: data.email });
    if (existingUser) {
      throw new ApiError(400, "User with this email already exists");
    }
    let userRole = await RoleModel.findOne({ name: "user" });
    if (!userRole) {
      userRole = await RoleModel.create({ name: "user", permissions: ["read:own"] });
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await UserModel.create({
      ...data,
      password: hashedPassword,
      roles: [userRole._id]
    });
    const token = this.generateToken(user);
    return {
      user: this.formatUserResponse(user, [userRole.name]),
      token
    };
  },
  /**
   * Validates credentials and returns a signed JWT.
   */
  async login(data) {
    const user = await UserModel.findOne({ email: data.email }).select("+password").populate("roles");
    if (!user || !await bcrypt.compare(data.password, user.password)) {
      throw new ApiError(401, "Invalid email or password");
    }
    const roleNames = user.roles.map((r) => r.name);
    const token = this.generateToken(user);
    return {
      user: this.formatUserResponse(user, roleNames),
      token
    };
  },
  async forgotPassword(email) {
    const user = await UserModel.findOne({ email });
    if (!user) throw new ApiError(404, "No user found with that email");
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1e3);
    await user.save();
    return resetToken;
  },
  async resetPassword(token, newPassword) {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await UserModel.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: /* @__PURE__ */ new Date() }
      // Must not be expired
    }).select("+password");
    if (!user) throw new ApiError(400, "Token is invalid or has expired");
    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = void 0;
    user.passwordResetExpires = void 0;
    await user.save();
    return { message: "Password reset successful" };
  },
  /**
   * Generates a JWT containing the user ID and assigned roles.
   */
  generateToken(user) {
    return jwt.sign(
      { id: user._id, roles: user.roles },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "24h" }
    );
  },
  /**
   * Formats the user object for API responses (removes sensitive fields).
   */
  formatUserResponse(user, roles) {
    return {
      id: user._id,
      email: user.email,
      name: user.name,
      roles
    };
  }
};
zodToOpenapi.extendZodWithOpenApi(zod.z);
const LoginSchema = registry.register("LoginUserRequest", zod.z.object({
  email: zod.z.string().email(),
  password: zod.z.string().min(6)
}));
const RegisterSchema = registry.register("RegisterUserRequest", zod.z.object({
  email: zod.z.string().email(),
  password: zod.z.string().min(6),
  name: zod.z.string().min(2)
}));
const AuthResponseSchema = registry.register("LoginUserResponse", zod.z.object({
  token: zod.z.string(),
  user: zod.z.object({
    id: zod.z.string(),
    email: zod.z.string(),
    name: zod.z.string(),
    roles: zod.z.array(zod.z.string())
  })
}));
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
const router$1 = express.Router();
registry.registerPath({
  method: "post",
  path: "/auth/register",
  summary: "Create a new user account",
  tags: ["Authentication"],
  request: {
    body: {
      content: { "application/json": { schema: RegisterSchema } }
    }
  },
  responses: {
    201: {
      description: "User created successfully",
      content: { "application/json": { schema: AuthResponseSchema } }
    }
  }
});
registry.registerPath({
  method: "post",
  path: "/auth/login",
  summary: "Authenticate user and get token",
  tags: ["Authentication"],
  request: {
    body: {
      content: { "application/json": { schema: LoginSchema } }
    }
  },
  responses: {
    200: {
      description: "Login successful",
      content: { "application/json": { schema: AuthResponseSchema } }
    }
  }
});
router$1.post(
  "/register",
  validate(RegisterSchema),
  catchAsync(async (req, res) => {
    const result = await AuthService.register(req.body);
    res.status(201).json(result);
  })
);
router$1.post(
  "/login",
  validate(LoginSchema),
  catchAsync(async (req, res) => {
    const result = await AuthService.login(req.body);
    res.status(200).json(result);
  })
);
router$1.post(
  "/forgot-password",
  catchAsync(async (req, res) => {
    const resetToken = await AuthService.forgotPassword(req.body.email);
    res.status(200).json({ message: "Token sent to email", token: resetToken });
  })
);
router$1.post(
  "/reset-password/:token",
  catchAsync(async (req, res) => {
    const result = await AuthService.resetPassword(
      req.params.token,
      req.body.password
    );
    res.status(200).json(result);
  })
);
const SensorDataSchema = new mongoose.Schema({
  device: { type: mongoose.Schema.Types.ObjectId, ref: "Device", required: true },
  value: { type: Number, required: true },
  unit: { type: String, required: true },
  dataType: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, {
  // Optimization: time-series data often benefits from specific indexing
  timeseries: {
    timeField: "timestamp",
    metaField: "device",
    granularity: "seconds"
  }
});
SensorDataSchema.index({ device: 1, timestamp: -1 });
const SensorDataModel = mongoose.model("SensorData", SensorDataSchema);
const SensorDataService = {
  async recordData(userId, deviceId, data) {
    const device = await DeviceModel.findOne({ _id: deviceId, owner: userId });
    if (!device) throw new ApiError(403, "Unauthorized: You do not own this device");
    return await SensorDataModel.create({
      device: deviceId,
      ...data
    });
  },
  async getDeviceHistory(userId, deviceId, limit = 100) {
    const device = await DeviceModel.findOne({ _id: deviceId, owner: userId });
    if (!device) throw new ApiError(403, "Unauthorized access to device data");
    return await SensorDataModel.find({ device: deviceId }).sort({ timestamp: -1 }).limit(limit);
  }
};
const CreateSensorDataSchema = registry.register("CreateSensorDataInput", zod.z.object({
  value: zod.z.number(),
  unit: zod.z.string(),
  dataType: zod.z.string(),
  deviceId: zod.z.string()
  // The device reporting the data
}));
registry.register("SensorDataResponse", zod.z.object({
  id: zod.z.string(),
  value: zod.z.number(),
  unit: zod.z.string(),
  dataType: zod.z.string(),
  timestamp: zod.z.date(),
  device: zod.z.string()
}));
const router = express.Router();
router.post(
  "/",
  authenticate,
  validate(CreateSensorDataSchema),
  catchAsync(async (req, res) => {
    const { deviceId, ...payload } = req.body;
    const data = await SensorDataService.recordData(req.user.id, deviceId, payload);
    res.status(201).json(data);
  })
);
const app = express();
connectDB();
const corsOptions = {
  origin: "http://localhost:5173",
  // Match your frontend's address
  methods: ["GET", "POST", "PUT", "DELETE"]
  // Specify the allowed HTTP methods
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/devices", router$3);
app.use("/api/users", router$2);
app.use("/api/auth", router$1);
app.use("/api/sensor", router);
const openApiDocs = generateOpenAPIDocs();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocs));
app.get("/api-docs.json", (req, res) => {
  res.json(openApiDocs);
});
app.use(morgan("combined", {
  stream: { write: (message) => logger.info(message.trim()) }
}));
app.use((err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  res.status(err.status || 500).json({ message: err.message });
});
app.use((req, res, next) => {
  next(new ApiError(404, "Route not found"));
});
app.use(errorHandler);
dotenv.config();
const viteNodeApp = app;
const PORT = process.env.PORT || 3e3;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
});
exports.viteNodeApp = viteNodeApp;
