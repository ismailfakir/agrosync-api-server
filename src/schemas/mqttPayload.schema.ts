import { z } from 'zod';
import { registry } from '../utils/openapi';

export const IngestMqttSchema = registry.register('IngestMqttInput', z.object({
  topic: z.string(),
  payload: z.any(),
  qos: z.number().min(0).max(2).optional(),
  retain: z.boolean().optional(),
}));

export const MqttPayloadResponseSchema = registry.register('MqttPayloadResponse', z.object({
  id: z.string(),
  topic: z.string(),
  payload: z.any(),
  receivedAt: z.date(),
}));