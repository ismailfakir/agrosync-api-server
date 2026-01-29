import { Router } from 'express';
import { UserService } from '../services/user.service';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { registry } from '../utils/openapi';

const router = Router();

registry.registerPath({
  method: 'get',
  path: '/users/me',
  summary: 'Get current user profile',
  tags: ['Users'],
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: 'User data' } },
});

router.get('/me', authenticate, async (req, res) => {
  const user = await UserService.findById(req.user!.id);
  res.json(user);
});

// Admin only: Get all users
router.get('/', authenticate, authorize(['admin']), async (req, res) => {
  const users = await UserService.findAll();
  res.json(users);
});

export default router;