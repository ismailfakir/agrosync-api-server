import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { registry } from '../utils/openapi';

extendZodWithOpenApi(z);

export const CreateDeviceCommandSchema = registry.register('IoTDeviceCommandRequest', z.object({
  commandId: z.string().min(3),
  deviceId: z.string().min(3),
  command: z.string().min(3),
}));

export const DeviceCommandResponseSchema = registry.register('IoTDeviceCommandResponse', z.object({
  id: z.string(),
  commandId: z.string().min(3),
  deviceId: z.string().min(3),
  command: z.string().min(3),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
}));