import type { Repository } from 'typeorm';
import type { User } from '../entities/user.entity.ts';
import { AppError } from '../errors/AppError.ts';
import { type findByIdUserDTO, type updateUserDTO } from '../dtos/user.dto.ts';
import bcrypt from 'bcrypt';
import { env } from '../configs/env.ts';
import type { UserPayload } from '../types/user.types.ts';

export class UserService {
  private userRepository: Repository<User>;

  constructor(userRepository: Repository<User>) {
    this.userRepository = userRepository;
  }

  public async findAll(): Promise<Omit<User, 'password'>[]> {
    return this.userRepository.find();
  }

  public async findById(userId: findByIdUserDTO): Promise<Omit<User, 'password'>> {
    return this.findEntityById(userId);
  }

  public async updateUser(
    userId: findByIdUserDTO,
    payload: updateUserDTO,
    requester: UserPayload
  ): Promise<Omit<User, 'password'>> {
    const user = await this.findEntityById(userId);

    if (requester.role === 'admin') {
      if (payload.role && (user.role === 'admin' || requester.id === userId.id)) {
        throw new AppError('Admin não pode alterar role de outro admin ou de si mesmo', 403);
      }
    }

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
