import { z } from 'zod';
import { registry } from '../utils/openapi';

export const CreateSensorDataSchema = registry.register('CreateSensorDataInput', z.object({
  value: z.number(),
  unit: z.string(),
  dataType: z.string(),
  deviceId: z.string(), // The device reporting the data
}));

export const SensorDataResponseSchema = registry.register('SensorDataResponse', z.object({
  id: z.string(),
  value: z.number(),
  unit: z.string(),
  dataType: z.string(),
  timestamp: z.date(),
  device: z.string(),
}));