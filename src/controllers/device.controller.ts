import { Router, Request, Response } from 'express';
import { DeviceService } from '../services/device.service';
import { CreateDeviceSchema } from '../schemas/device.schema';
import { validate } from '../middlewares/validate.middleware';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { registry } from '../utils/openapi';
import { z } from 'zod';
import { catchAsync } from '../utils/catchAsync';
import { ApiError } from '../utils/apiError';

const router = Router();

// --- OpenAPI Documentation Definitions ---
registry.registerPath({
  method: 'post',
  path: '/devices',
  summary: 'Create a new IoT Device',
  tags: ['Devices'],
  security: [{ bearerAuth: [] }],
  request: {
    body: { content: { 'application/json': { schema: CreateDeviceSchema } } },
  },
  responses: {
    201: { description: 'Device created successfully' },
    400: { description: 'Validation Error' },
  },
});

// --- Implementation ---
router.post(
  '/',
  authenticate,
  validate(CreateDeviceSchema),
  async (req: Request, res: Response) => {
    try {
      // Assuming 'user' role for basic creation
      console.log("creating device: "+req.body);
      console.log("user id: "+req.user!.id);
      const device = await DeviceService.create(req.body, req.user!.id);
      res.status(201).json(device);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }
);

registry.registerPath({
  method: 'get',
  path: '/devices',
  summary: 'Get all devices',
  tags: ['Devices'],
  security: [{ bearerAuth: [] }],
  responses: {
    200: { description: 'List of devices' },
  },
});

router.get('/', authenticate, async (req: Request, res: Response) => {
  const devices = await DeviceService.findAll(req.user!.id, req.user!.roles[0]); // simplistic role check
  if (!devices) {
    // This will trigger the global error handler
    throw new ApiError(404, 'Device not found');
  }
  res.json(devices);
});

export default router;