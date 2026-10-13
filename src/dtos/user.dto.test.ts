import { describe, it, expect } from 'vitest';
import { updateUserSchema } from './user.dto.ts';

describe('User DTOs - empty fields validation (BUG06)', () => {
  describe('updateUserSchema', () => {
    it('should reject a name with only spaces', () => {
      const data = { name: '   ' };
      const result = updateUserSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject a password with only spaces', () => {
      const data = { password: '   ' };
      const result = updateUserSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should allow valid partial data', () => {
      const data = { name: 'Alice' };
      const result = updateUserSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should not accept a role field (US04: role não pode ser alterada via update)', () => {
      const result = updateUserSchema.safeParse({ name: 'Alice', role: 'admin' });
      expect(result.success).toBe(true);
      expect(result.data).not.toHaveProperty('role');
    });

    it('should not accept an active field (US04: active não pode ser alterado via update)', () => {
      const result = updateUserSchema.safeParse({ active: false });
      expect(result.success).toBe(true);
      expect(result.data).not.toHaveProperty('active');
    });
  });
});
