import { z } from 'zod';

export const emailSchema = (message = 'O email inserido é inválido') =>
  z.email(message).transform(email => email.trim().toLowerCase());

export const registerUserSchema = z.object({
  name: z.string('O nome deve ser uma string').min(1, 'O nome é obrigatório'),
  email: emailSchema('O email inserido é inválido'),
  password: z.string('A senha deve ser uma string').min(1, 'A senha é obrigatória'),
});

export type registerUserDTO = z.infer<typeof registerUserSchema>;

export const loginUserSchema = z.object({
  email: emailSchema('Email ou senha incorretos'),
  password: z.string('Email ou senha incorretos').min(1, 'A senha é obrigatória'),
});

export type loginUserDTO = z.infer<typeof loginUserSchema>;

export const refreshTokenSchema = z.object({
  refreshToken: z
    .string('O refreshToken deve ser uma string')
    .min(1, 'O token não pode estar vazio')
    .max(8192, 'O token é grande demais (máximo de 8KB)')
    .regex(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+$/, 'Formato de JWT inválido'),
});

export type refreshTokenDTO = z.infer<typeof refreshTokenSchema>;
