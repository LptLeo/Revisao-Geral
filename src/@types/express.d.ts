import type { UserPayload } from '../types/user.types.ts';

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}
