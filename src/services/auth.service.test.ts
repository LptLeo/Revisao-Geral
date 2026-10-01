import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../configs/env.ts';
import type { User } from '../entities/user.entity.ts';

vi.mock('bcrypt', () => ({
  default: { hash: vi.fn(), compare: vi.fn() },
}));
vi.mock('jsonwebtoken', () => ({
  default: { sign: vi.fn(), verify: vi.fn() },
}));

import { AuthService } from './auth.service.ts';

const mockRepo = () => ({
  findOneBy: vi.fn(),
  findOne: vi.fn(),
  create: vi.fn(),
  save: vi.fn(),
});

describe('AuthService', () => {
  let repo: ReturnType<typeof mockRepo>;
  let service: AuthService;

  beforeEach(() => {
    repo = mockRepo();
    service = new AuthService(repo as never);
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('rejects when email already exists', async () => {
      repo.findOneBy.mockResolvedValue({ id: '1', email: 'a@b.com' });
      await expect(
        service.register({ name: 'A', email: 'a@b.com', password: 'x' })
      ).rejects.toThrow(expect.objectContaining({ statusCode: 409 }));
    });

    it('hashes password and saves new user', async () => {
      repo.findOneBy.mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed' as never);
      repo.create.mockReturnValue({ name: 'A', email: 'a@b.com', password: 'hashed' });
      repo.save.mockResolvedValue({
        id: 'new-id',
        name: 'A',
        email: 'a@b.com',
        password: 'hashed',
      });

      const result = await service.register({ name: 'A', email: 'a@b.com', password: 'x' });

      expect(bcrypt.hash).toHaveBeenCalledWith('x', env.BCRYPT_SALT);
      expect(repo.save).toHaveBeenCalled();
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('login', () => {
    const user = {
      id: 'u1',
      name: 'Alice',
      email: 'alice@test.com',
      password: 'hashed-pw',
      role: 'user',
      active: true,
    } as unknown as User & { __test: never };

    beforeEach(() => {
      vi.mocked(jwt.sign).mockReturnValue('token' as never);
    });

    it('rejects when user not found', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.login({ email: 'x@x.com', password: 'y' })).rejects.toThrow(
        expect.objectContaining({ statusCode: 401 })
      );
    });

    it('rejects when user is inactive', async () => {
      repo.findOne.mockResolvedValue({ ...user, active: false });
      await expect(service.login({ email: 'alice@test.com', password: 'y' })).rejects.toThrow(
        expect.objectContaining({ statusCode: 403 })
      );
    });

    it('rejects when password does not match', async () => {
      repo.findOne.mockResolvedValue(user);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(service.login({ email: 'alice@test.com', password: 'wrong' })).rejects.toThrow(
        expect.objectContaining({ statusCode: 401 })
      );
    });

    it('returns user without password and tokens on success', async () => {
      repo.findOne.mockResolvedValue(user);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await service.login({ email: 'alice@test.com', password: 'ok' });

      expect(result.user).not.toHaveProperty('password');
      expect(result.tokens).toHaveProperty('accessToken');
      expect(result.tokens).toHaveProperty('refreshToken');
    });
  });

  describe('refreshToken', () => {
    it('rejects invalid token', async () => {
      vi.mocked(jwt.verify).mockImplementation(() => {
        throw new Error('invalid');
      });

      await expect(service.refreshToken('bad')).rejects.toThrow(
        expect.objectContaining({ statusCode: 401 })
      );
    });

    it('rejects inactive user', async () => {
      vi.mocked(jwt.verify).mockReturnValue({ id: 'u1' } as never);
      repo.findOneBy.mockResolvedValue({ id: 'u1', active: false });

      await expect(service.refreshToken('valid')).rejects.toThrow(
        expect.objectContaining({ statusCode: 401 })
      );
    });

    it('returns new tokens for active user', async () => {
      vi.mocked(jwt.verify).mockReturnValue({ id: 'u1' } as never);
      repo.findOneBy.mockResolvedValue({ id: 'u1', name: 'Alice', role: 'user', active: true });
      vi.mocked(jwt.sign).mockReturnValue('new-token' as never);

      const tokens = await service.refreshToken('valid');

      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
    });
  });
});
