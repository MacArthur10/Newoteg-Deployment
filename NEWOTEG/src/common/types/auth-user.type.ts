import { Role } from '@prisma/client';

export type AuthUser = {
  userId: string;
  storeId: string;
  role: Role;
  email: string;
};
