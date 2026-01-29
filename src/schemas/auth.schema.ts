import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { registry } from '../utils/openapi';

extendZodWithOpenApi(z);

export const LoginSchema = registry.register('LoginInput', z.object({
  email: z.string().email(),
  password: z.string().min(6),
}));

export const RegisterSchema = registry.register('RegisterInput', z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
}));

export const AuthResponseSchema = registry.register('AuthResponse', z.object({
  token: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
    roles: z.array(z.string()),
  }),
}));