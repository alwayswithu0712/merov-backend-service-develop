import { Prisma } from '@prisma/client';

export type UpdateOrderDto = Prisma.OrderUpdateInput & { status: string };
