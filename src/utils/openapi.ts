import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import * as yaml from 'yaml';
import fs from 'fs';

export const registry = new OpenAPIRegistry();

export const generateOpenAPIDocs = () => {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  const doc = generator.generateDocument({
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'IoT Management API',
      description: 'API for managing IoT devices and users',
    },
    servers: [{ url: 'http://localhost:3000/api' }],
  });

  return doc;
};

// Register Security Scheme (JWT)
registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});