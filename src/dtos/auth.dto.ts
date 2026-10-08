import { z } from 'zod';

export const emailSchema = (message = 'O email inserido é inválido') =>
  z.email(message).transform(email => email.trim().toLowerCase());

export const nameSchema = (message = 'O nome é obrigatório') => z.string().trim().min(1, message);

export const passwordSchema = (message = 'A senha é obrigatória') =>
  z
    .string()
    .min(1, message)
    .refine(val => val.trim().length > 0, message);

export const registerUserSchema = z.object({
  name: nameSchema('O nome é obrigatório'),
  email: emailSchema('O email inserido é inválido'),
  password: passwordSchema('A senha é obrigatória'),
});

export type registerUserDTO = z.infer<typeof registerUserSchema>;

export const loginUserSchema = z.object({
  email: emailSchema('Email ou senha incorretos'),
  password: passwordSchema('Email ou senha incorretos'),
});

export type loginUserDTO = z.infer<typeof loginUserSchema>;
