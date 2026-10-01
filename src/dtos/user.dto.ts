import { z } from 'zod';
import { UserRole } from '../entities/user.entity.ts';

export const findByIdUserSchema = z.object({
  id: z.uuid('O parâmetro deve obrigatoriamente ser do tipo UUID.'),
});

export type findByIdUserDTO = z.infer<typeof findByIdUserSchema>;

import { emailSchema } from './auth.dto.ts';

export const updateUserSchema = z.object({
  name: z.string('O nome deve ser uma string').min(1, 'O nome é obrigatório').optional(),
  email: emailSchema('O email inserido é inválido').optional(),
  password: z.string('A senha deve ser uma string').min(1, 'A senha é obrigatória').optional(),
  role: z.enum(UserRole).optional(),
});

export type updateUserDTO = z.infer<typeof updateUserSchema>;
