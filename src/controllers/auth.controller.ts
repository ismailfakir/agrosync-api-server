import { Router, Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import {
  LoginSchema,
  RegisterSchema,
  AuthResponseSchema,
} from "../schemas/auth.schema";
import { validate } from "../middlewares/validate.middleware";
import { catchAsync } from "../utils/catchAsync";
import { registry } from "../utils/openapi";
//import { Article, ArticleInput } from "../types/api";

const router = Router();

// --- OpenAPI Documentation Definitions ---

registry.registerPath({
  method: "post",
  path: "/auth/register",
  summary: "Create a new user account",
  tags: ["Authentication"],
  request: {
    body: {
      content: { "application/json": { schema: RegisterSchema } },
    },
  },
  responses: {
    201: {
      description: "User created successfully",
      content: { "application/json": { schema: AuthResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/login",
  summary: "Authenticate user and get token",
  tags: ["Authentication"],
  request: {
    body: {
      content: { "application/json": { schema: LoginSchema } },
    },
  },
  responses: {
    200: {
      description: "Login successful",
      content: { "application/json": { schema: AuthResponseSchema } },
    },
  },
});

// --- Implementation Routes ---

router.post(
  "/register",
  validate(RegisterSchema),
  catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.register(req.body);
    res.status(201).json(result);
  }),
);

router.post(
  "/login",
  validate(LoginSchema),
  catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.login(req.body);
    res.status(200).json(result);
  }),
);

// Forgot Password
router.post(
  "/forgot-password",
  catchAsync(async (req: Request, res: Response) => {
    const resetToken = await AuthService.forgotPassword(req.body.email);
    // For development, we return the token. In production, send via email.
    res.status(200).json({ message: "Token sent to email", token: resetToken });
  }),
);

// Reset Password
interface UserParams {
  token: string;
  password: string;
}
router.post(
  "/reset-password/:token",
  catchAsync(async (req: Request<UserParams>, res: Response) => {
    const result = await AuthService.resetPassword(
      req.params.token,
      req.body.password,
    );
    res.status(200).json(result);
  }),
);

export default router;
