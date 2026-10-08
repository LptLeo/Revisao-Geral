import { describe, it, expect } from 'vitest';
import { registerUserSchema, loginUserSchema } from './auth.dto.ts';

describe('Auth DTOs - empty fields validation (BUG06)', () => {
  describe('registerUserSchema', () => {
    it('should reject a name with only spaces', () => {
      const data = { name: '   ', email: 'test@email.com', password: 'password123' };
      const result = registerUserSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject an empty name', () => {
      const data = { name: '', email: 'test@email.com', password: 'password123' };
      const result = registerUserSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject a password with only spaces', () => {
      const data = { name: 'Alice', email: 'test@email.com', password: '   ' };
      const result = registerUserSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject an empty password', () => {
      const data = { name: 'Alice', email: 'test@email.com', password: '' };
      const result = registerUserSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should allow valid data', () => {
      const data = { name: 'Alice', email: 'test@email.com', password: 'password123' };
      const result = registerUserSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('loginUserSchema', () => {
    it('should reject a password with only spaces', () => {
      const data = { email: 'test@email.com', password: '   ' };
      const result = loginUserSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
