import { describe, it, expect, vi } from 'vitest';
import { AuthService } from '../auth.service';

describe('AuthService', () => {
  it('should generate a valid JWT token', () => {
    const mockUser = { _id: '123', email: 'test@test.com', roles: [] } as any;
    const token = AuthService.generateToken(mockUser);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });
});