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
  });
});
