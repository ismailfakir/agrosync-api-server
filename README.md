AGROSYNC REST API SERVER
A production-ready REST API built with TypeScript, Express, and MongoDB. This project manages Users, Roles, and IoT Devices with a focus on security, scalability, and developer experience.

🚀 Features
Vite-powered Backend: Extremely fast development starts and HMR using vite-node.

Auto-generated Documentation: Swagger UI generated directly from Zod schemas via @asteasolutions/zod-to-openapi.

Secure Authentication: JWT-based authentication with Role-Based Access Control (RBAC).

Robust Validation: Request body and parameter validation using Zod.

Observability: Structured logging with Winston and Morgan.

Resiliency: Centralized global error handling and catchAsync wrappers.

Containerized: Fully Dockerized for both development and production.

Component,Technology
Runtime,Node.js (v18+)
Bundler/Runner,Vite / Vite-Node
Language,TypeScript
Framework,Express.js
Database,MongoDB (via Mongoose)
Validation,Zod
Documentation,OpenAPI 3.0 (Swagger)
Logging,Winston & Morgan

Development Commands
npm run dev: Starts the Vite development server.

npm run build: Builds the project for production.

npm run seed: Populates the DB with initial roles/admin.

npm run preview: Runs the built production files.

npm run generate-types: RUN to build types