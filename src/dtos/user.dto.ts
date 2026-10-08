import { z } from 'zod';
import { UserRole } from '../entities/user.entity.ts';

export const findByIdUserSchema = z.object({
  id: z.uuid('O parâmetro deve obrigatoriamente ser do tipo UUID.'),
});

export type findByIdUserDTO = z.infer<typeof findByIdUserSchema>;

import { emailSchema, nameSchema, passwordSchema } from './auth.dto.ts';

export const updateUserSchema = z.object({
  name: nameSchema('O nome é obrigatório').optional(),
  email: emailSchema('O email inserido é inválido').optional(),
  password: passwordSchema('A senha é obrigatória').optional(),
  role: z.enum(UserRole).optional(),
});

export type updateUserDTO = z.infer<typeof updateUserSchema>;
