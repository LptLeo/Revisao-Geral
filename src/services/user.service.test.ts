import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from './user.service.ts';
import { UserRole } from '../entities/user.entity.ts';

const mockRepo = () =>
  ({
    findOneBy: vi.fn(),
    merge: vi.fn(),
    save: vi.fn(),
  }) as any;

describe('UserService', () => {
  let repo: any;
  let service: UserService;

  beforeEach(() => {
    repo = mockRepo();
    service = new UserService(repo);
    vi.clearAllMocks();
  });

  describe('updateUser', () => {
    const requester = { id: 'admin-1', role: UserRole.ADMIN, name: 'Admin' };
    const targetUser = { id: 'user-2', role: UserRole.USER, email: 'u@t.com' };

    it('updates own profile', async () => {
      repo.findOneBy.mockResolvedValueOnce(targetUser);
      repo.merge.mockReturnValue({ ...targetUser, name: 'New Name' });
      repo.save.mockResolvedValue({ ...targetUser, name: 'New Name' });

      const result = await service.updateUser(
        { id: 'user-2' },
        { name: 'New Name' },
        { id: 'user-2', role: UserRole.USER, name: 'User' }
      );
      expect(result.name).toBe('New Name');
    });

    it('rejects admin changing role of another admin', async () => {
      repo.findOneBy.mockResolvedValueOnce({ id: 'admin-2', role: UserRole.ADMIN });
      await expect(
        service.updateUser({ id: 'admin-2' }, { role: UserRole.USER }, requester)
      ).rejects.toThrow(expect.objectContaining({ statusCode: 403 }));
    });
  });
});
