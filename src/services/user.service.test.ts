import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Repository } from 'typeorm';
import type { User } from '../entities/user.entity.ts';
import { UserService } from './user.service.ts';
import bcrypt from 'bcrypt';

vi.mock('bcrypt', () => ({
  default: { hash: vi.fn(async () => 'hashed-password') },
}));

type MockUserRepository = {
  findOneBy: ReturnType<typeof vi.fn>;
  merge: ReturnType<typeof vi.fn>;
  save: ReturnType<typeof vi.fn>;
};

const mockRepo = (): MockUserRepository => ({
  findOneBy: vi.fn(),
  merge: vi.fn(),
  save: vi.fn(),
});

const baseUser = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Alice',
  email: 'alice@mail.com',
  password: 'old-hash',
  role: 'user',
  active: true,
} as unknown as User;

describe('UserService', () => {
  let repo: MockUserRepository;
  let service: UserService;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = mockRepo();
    service = new UserService(repo as unknown as Repository<User>);
  });

  describe('updateUser', () => {
    it('atualiza os dados e retorna o usuário sem a senha', async () => {
      repo.findOneBy.mockResolvedValue(baseUser);
      repo.merge.mockImplementation(
        (user: User, payload: Partial<User>) => ({ ...user, ...payload }) as User
      );
      repo.save.mockImplementation(async (user: User) => user);

      const result = await service.updateUser({ id: baseUser.id }, { name: 'Alice Silva' });

      expect(result.name).toBe('Alice Silva');
      expect(result).not.toHaveProperty('password');
    });

    it('lança AppError 404 quando o usuário não existe', async () => {
      repo.findOneBy.mockResolvedValue(null);

      await expect(service.updateUser({ id: baseUser.id }, { name: 'X' })).rejects.toMatchObject({
        name: 'AppError',
        statusCode: 404,
      });
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('lança AppError 409 quando o e-mail já está em uso por outro usuário', async () => {
      const otherUser = { ...baseUser, id: 'outro-id', email: 'taken@mail.com' } as User;
      repo.findOneBy
        .mockResolvedValueOnce(baseUser) // busca pelo id
        .mockResolvedValueOnce(otherUser); // busca pelo e-mail

      await expect(
        service.updateUser({ id: baseUser.id }, { email: 'taken@mail.com' })
      ).rejects.toMatchObject({ name: 'AppError', statusCode: 409 });
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('permite manter o próprio e-mail sem disparar conflito', async () => {
      repo.findOneBy.mockResolvedValue(baseUser);
      repo.merge.mockReturnValue(baseUser);
      repo.save.mockResolvedValue(baseUser);

      await service.updateUser({ id: baseUser.id }, { email: baseUser.email });

      expect(repo.save).toHaveBeenCalledOnce();
    });

    it('hasheia a senha com bcrypt antes de persistir', async () => {
      repo.findOneBy.mockResolvedValue(baseUser);
      repo.merge.mockImplementation(
        (user: User, payload: Partial<User>) => ({ ...user, ...payload }) as User
      );
      repo.save.mockImplementation(async (user: User) => user);

      const result = await service.updateUser({ id: baseUser.id }, { password: 'NewPass#1' });

      expect(bcrypt.hash).toHaveBeenCalledWith('NewPass#1', expect.anything());
      expect(result).not.toHaveProperty('password');
      expect(repo.merge).toHaveBeenCalledWith(
        baseUser,
        expect.objectContaining({ password: 'hashed-password' })
      );
    });

    it('não rehasheia quando a senha não é enviada', async () => {
      repo.findOneBy.mockResolvedValue(baseUser);
      repo.merge.mockReturnValue(baseUser);
      repo.save.mockResolvedValue(baseUser);

      await service.updateUser({ id: baseUser.id }, { name: 'Novo Nome' });

      expect(bcrypt.hash).not.toHaveBeenCalled();
    });
  });
});
