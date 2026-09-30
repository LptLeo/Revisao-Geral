import type { UserRole } from '../entities/user.entity.ts';

export interface UserPayload {
  id: string;
  name: string;
  role: UserRole;
}

export type { UserRole };
