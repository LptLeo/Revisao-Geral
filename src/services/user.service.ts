import type { FindOptionsWhere, Repository } from 'typeorm';
import { ILike } from 'typeorm';
import type { User } from '../entities/user.entity.ts';
import { AppError } from '../errors/AppError.ts';
import { type findByIdUserDTO, type listUsersDTO, type updateUserDTO } from '../dtos/user.dto.ts';
import type { Paginated } from '../types/pagination.types.ts';
import bcrypt from 'bcrypt';
import { env } from '../configs/env.ts';

export class UserService {
  private userRepository: Repository<User>;

  constructor(userRepository: Repository<User>) {
    this.userRepository = userRepository;
  }

  public async findAll(query: listUsersDTO): Promise<Paginated<Omit<User, 'password'>>> {
    const { page, limit, search, role, active } = query;

    const baseWhere: FindOptionsWhere<User> = {
      ...(role !== undefined ? { role } : {}),
      ...(active !== undefined ? { active } : {}),
    };

    const where: FindOptionsWhere<User> | FindOptionsWhere<User>[] = search
      ? [
          { ...baseWhere, name: ILike(`%${search}%`) },
          { ...baseWhere, email: ILike(`%${search}%`) },
        ]
      : baseWhere;

    const [users, total] = await this.userRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: users.map(({ password: _password, ...user }) => user),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  public async findById(userId: findByIdUserDTO): Promise<Omit<User, 'password'>> {
    return this.findEntityById(userId);
  }

  public async updateUser(
    userId: findByIdUserDTO,
    payload: updateUserDTO
  ): Promise<Omit<User, 'password'>> {
    const user = await this.findEntityById(userId);

    if (payload.email && payload.email !== user.email) {
      const existing = await this.userRepository.findOneBy({ email: payload.email });

      if (existing) throw new AppError('E-mail já está em uso', 409);
    }

    if (payload.password) {
      payload = {
        ...payload,
        password: await bcrypt.hash(payload.password, env.BCRYPT_SALT),
      };
    }

    const updatedUser = this.userRepository.merge(user, payload);
    const savedUser = await this.userRepository.save(updatedUser);

    const { password: _password, ...userWithoutPassword } = savedUser;

    return userWithoutPassword;
  }

  private async findEntityById(userId: findByIdUserDTO): Promise<User> {
    const user = await this.userRepository.findOneBy({ id: userId.id });

    if (!user) throw new AppError(`Usuário com ID ${userId.id} não encontrado`, 404);

    return user;
  }
}
