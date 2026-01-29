import express from 'express';
import morgan from 'morgan';
import logger from './utils/logger';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { connectDB } from './config/db';
import { generateOpenAPIDocs } from './utils/openapi';
import { errorHandler } from './middlewares/error.middleware';
import { ApiError } from './utils/apiError';

// Import Routes
import deviceRoutes from './controllers/device.controller';
import userRoutes from './controllers/user.controller';
import authRoutes from './controllers/auth.controller'; // (Implement similar to device)
import sensorRoutes from './controllers/sensor.controller';

const app = express();

// Connect DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/devices', deviceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/sensor', sensorRoutes);

// OpenAPI / Swagger
const openApiDocs = generateOpenAPIDocs();
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocs));
app.get('/api-docs.json', (req, res) => {
  res.json(openApiDocs);
});

// Morgan HTTP Logging
// We create a stream for Morgan to write to Winston
app.use(morgan('combined', { 
  stream: { write: (message) => logger.info(message.trim()) } 
}));

// Example usage in a route or error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  res.status(err.status || 500).json({ message: err.message });
});

// Handle 404 (Route not found)
app.use((req, res, next) => {
  next(new ApiError(404, 'Route not found'));
});

// The error handler must be the LAST middleware
app.use(errorHandler);

export default app;