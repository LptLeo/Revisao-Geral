import { describe, it, expect } from 'vitest';
import { listUsersSchema, updateUserSchema } from './user.dto.ts';

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

describe('User DTOs - listUsersSchema (US05)', () => {
  it('should apply defaults page=1 and limit=10 when params are absent', () => {
    const result = listUsersSchema.parse({});
    expect(result).toEqual({ page: 1, limit: 10 });
  });

  it('should coerce page and limit from query strings', () => {
    const result = listUsersSchema.parse({ page: '2', limit: '25' });
    expect(result.page).toBe(2);
    expect(result.limit).toBe(25);
  });

  it('should reject page below 1', () => {
    expect(listUsersSchema.safeParse({ page: '0' }).success).toBe(false);
  });

  it('should reject non-numeric page', () => {
    expect(listUsersSchema.safeParse({ page: 'abc' }).success).toBe(false);
  });

  it('should reject limit above 100', () => {
    expect(listUsersSchema.safeParse({ limit: '101' }).success).toBe(false);
  });

  it('should trim the search term', () => {
    const result = listUsersSchema.parse({ search: '  joao  ' });
    expect(result.search).toBe('joao');
  });

  it('should reject an empty search term', () => {
    expect(listUsersSchema.safeParse({ search: '   ' }).success).toBe(false);
  });

  it('should accept valid role and reject invalid role', () => {
    expect(listUsersSchema.parse({ role: 'admin' }).role).toBe('admin');
    expect(listUsersSchema.safeParse({ role: 'superadmin' }).success).toBe(false);
  });

  it('should convert active from string to boolean', () => {
    expect(listUsersSchema.parse({ active: 'true' }).active).toBe(true);
    expect(listUsersSchema.parse({ active: 'false' }).active).toBe(false);
  });

  it('should reject active with invalid value', () => {
    expect(listUsersSchema.safeParse({ active: 'yes' }).success).toBe(false);
  });

  it('should keep filters undefined when not provided', () => {
    const result = listUsersSchema.parse({});
    expect(result.search).toBeUndefined();
    expect(result.role).toBeUndefined();
    expect(result.active).toBeUndefined();
  });
});
