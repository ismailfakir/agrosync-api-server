import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { registry } from '../utils/openapi';

extendZodWithOpenApi(z);

export const CreateDeviceSchema = registry.register('CreateDeviceRequest', z.object({
  name: z.string().min(3),
  location: z.string().min(3),
  type: z.string(),
  status: z.enum(['online', 'offline', 'maintenance']).optional(),
}));

export const DeviceResponseSchema = registry.register('CreateDeviceResponse', z.object({
  id: z.string(),
  name: z.string(),
  location: z.string(),
  type: z.string(),
  status: z.string(),
  owner: z.string(), // User ID
  createdAt: z.date().optional(),
}));