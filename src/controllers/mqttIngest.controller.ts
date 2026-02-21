import { Router, Request, Response } from 'express';
import { MqttPayloadService } from '../services/mqttPayload.service';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { catchAsync } from '../utils/catchAsync';

const router = Router();

// Only internal systems/admins should be able to view raw MQTT logs
router.get(
  '/logs',
  authenticate,
  authorize(['admin']),
  catchAsync(async (rreq: Request, res: Response) => {
    const logs = await MqttPayloadService.getRecentPayloads();
    res.json(logs);
  })
);

export default router;