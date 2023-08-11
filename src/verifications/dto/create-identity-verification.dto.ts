import { Prisma } from '@prisma/client';
export type CreateIdentityVerificationDto = Omit<Prisma.IdentityVerificationCreateInput, 'user'>;
