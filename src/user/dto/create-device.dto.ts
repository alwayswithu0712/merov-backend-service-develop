import { Prisma } from '@prisma/client';

export class CreateDeviceDto implements Omit<Prisma.DeviceUncheckedCreateInput, 'userId'> {
    firebaseToken: string;
}
