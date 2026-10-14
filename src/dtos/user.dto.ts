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
});

export type updateUserDTO = z.infer<typeof updateUserSchema>;

export const listUsersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().min(1).optional(),
  role: z.enum(UserRole).optional(),
  active: z
    .enum(['true', 'false'])
    .transform(value => value === 'true')
    .optional(),
});

export type listUsersDTO = z.infer<typeof listUsersSchema>;
