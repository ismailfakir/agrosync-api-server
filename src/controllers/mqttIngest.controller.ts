import { Router } from 'express';
import { MqttPayloadService } from '../services/mqttPayload.service';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { catchAsync } from '../utils/catchAsync';

const router = Router();

// Only internal systems/admins should be able to view raw MQTT logs
router.get(
  '/logs',
  authenticate,
  authorize(['admin']),
  catchAsync(async (req, res) => {
    const logs = await MqttPayloadService.getRecentPayloads();
    res.json(logs);
  })
);

export default router;