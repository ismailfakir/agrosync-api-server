import { Router, Request, Response } from 'express';
import { DeviceCommandService } from '../services/deviceCommand.service';
import { CreateDeviceCommandSchema } from '../schemas/deviceCommand.schema';
import { validate } from '../middlewares/validate.middleware';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { registry } from '../utils/openapi';
import { z } from 'zod';
import { catchAsync } from '../utils/catchAsync';
import { ApiError } from '../utils/apiError';
import dotenv from 'dotenv';
import { mqttService } from '../services/MqttService';

dotenv.config();

interface SensorCommand {
  state: string;
}

const router = Router();

// --- OpenAPI Documentation Definitions ---
registry.registerPath({
  method: 'post',
  path: '/devices/command',
  summary: 'Create a new IoT Device command',
  tags: ['Devices'],
  security: [{ bearerAuth: [] }],
  request: {
    body: { content: { 'application/json': { schema: CreateDeviceCommandSchema } } },
  },
  responses: {
    201: { description: 'Device command created successfully' },
    400: { description: 'Validation Error' },
  },
});

// --- Implementation ---
router.post(
  '/',
  authenticate,
  validate(CreateDeviceCommandSchema),
  async (req: Request, res: Response) => {
    try {
      // Assuming 'user' role for basic creation
      console.log(`Sending Sensor command in topic: ${process.env.MQTT_SENSORE_TOPIC_LIGHT}`);
      //const COMMAND_TOPIC = process.env.MQTT_SENSORE_TOPIC_LIGHT || '/RaspberryPiPicoW2/light';
      const COMMAND_TOPIC = '/agrosync/'+req.body.deviceId+'/command'
      mqttService.publish(COMMAND_TOPIC,req.body);
      console.log("creating device command: "+JSON.stringify(req.body));
      console.log("user id: "+req.user!.id);
      const device = await DeviceCommandService.create(req.body, req.user!.id);
      res.status(201).json(device);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }
);

registry.registerPath({
  method: 'get',
  path: '/devices/command',
  summary: 'Get all device command',
  tags: ['Devices'],
  security: [{ bearerAuth: [] }],
  responses: {
    200: { description: 'List of devices' },
  },
});

router.get('/', authenticate, async (req: Request, res: Response) => {
  const devices = await DeviceCommandService.findAll(req.user!.id, req.user!.roles[0]); // simplistic role check
  if (!devices) {
    // This will trigger the global error handler
    throw new ApiError(404, 'Device not found');
  }
  res.json(devices);
});

export default router;