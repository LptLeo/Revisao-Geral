import type { Repository } from "typeorm";
import type { User } from "../entities/user.entity.ts";
import type { loginUserDTO, registerUserDTO } from "../dtos/auth.dto.ts"
import { AppError } from "../errors/AppError.ts";
import bcrypt from "bcrypt";
import { env } from "../configs/env.ts";
import * as jwt from "jsonwebtoken";

export class AuthService {
    private userRepository: Repository<User>;

    constructor(userRepository: Repository<User>) {
        this.userRepository = userRepository;
    }

    public async register(data: registerUserDTO) {
        const email = await this.userRepository.findOneBy({ email: data.email });
        if (email) throw new AppError("O email já existe", 409);

        const passwordHash = await bcrypt.hash(data.password, env.BCRYPT_SALT);

        const newUser = this.userRepository.create({
            name: data.name,
            email: data.email,
            password: passwordHash,
        })

        const savedUser = await this.userRepository.save(newUser);

        const { password, ...userWithoutPassword } = savedUser;

        return userWithoutPassword;
    }

    public async login(data: loginUserDTO) {
        const user = await this.userRepository.findOne({
            where: { email: data.email },
            select: { "id": true, "name": true, "email": true, "password": true, "active": true, "role": true },
        })

        if (!user) throw new AppError('E-mail ou senha incorretos.', 401);
        if (!user.active) throw new AppError('Este usuário está desativado.', 403);

        const ok = await bcrypt.compare(data.password, user.password);
        if (!ok) throw new AppError("E-mail ou senha incorretos.", 401);

        const tokens = this.generateToken(user);

        const { password, ...noPassword } = user;

        return { user: noPassword, tokens };
    }

    private generateToken(user: { id: string, name: string, role: string }) {
        const accessToken = jwt.sign(
            { id: user.id, name: user.name, role: user.role },
            env.JWT_SECRET,
            { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] & string }
        );

        const refreshToken = jwt.sign(
            { id: user.id },
            env.JWT_REFRESH_SECRET,
            { expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"] & string }
        )

        return { accessToken, refreshToken };
    }

    public async refreshToken(refreshToken: string) {
        try {
            const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { id: string };

            const user = await this.userRepository.findOneBy({ id: payload.id });
            if (!user || !user.active) {
                throw new AppError("Usuário inválido ou desativado.", 401);
            }

            return this.generateToken(user);
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError("Refresh token inválido ou expirado.", 401);
        }
    }
}