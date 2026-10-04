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
