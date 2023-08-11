import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Address, Prisma } from '@prisma/client';
import { PrismaService } from '../shared/services/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
    constructor(private prisma: PrismaService) {}
    private readonly logger = new Logger(AddressesService.name);

    async findAll(params: { where?: Prisma.AddressWhereInput }): Promise<Address[]> {
        const addresses = await this.prisma.address.findMany({
            ...params,
        });
        return addresses;
    }

    async getById(id: string): Promise<Address> {
        const address = await this.prisma.address.findUnique({
            where: {
                id,
            },
        });

        if (!address) {
            throw new NotFoundException(`Delivery address with id ${id} not found`);
        }

        return address;
    }

    async create(createAddressDto: CreateAddressDto, accountId: string): Promise<Address> {
        //TODO: Check in the users have the permissions to set sendBirdAccessToken
        const createdAddress = await this.prisma.address.create({
            data: {
                ...createAddressDto,
                account: {
                    connect: {
                        id: accountId,
                    },
                },
            },
        });
        return createdAddress;
    }

    async update(id: string, data: UpdateAddressDto): Promise<Address> {
        const address = await this.prisma.address.update({
            where: {
                id,
            },
            data,
        });

        return address;
    }

    async delete(id: string): Promise<void> {
        await this.prisma.address.delete({
            where: {
                id,
            },
        });
    }
}
