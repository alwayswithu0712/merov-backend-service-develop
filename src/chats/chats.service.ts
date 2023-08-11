import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ProductsService } from '../products/products.service';
import { PrismaService } from '../shared/services/prisma.service';
import { UserService } from '../user/user.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { SendBirdService } from '../shared/services/sendbird.service';
import { Chat } from './dto/chat';
import { generateId } from '../shared/helpers/id';
import { InternalServerErrorException } from '@nestjs/common/exceptions/internal-server-error.exception';
import { AccountsService } from '../accounts/accounts.service';

@Injectable()
export class ChatService {
    constructor(
        private accountsService: AccountsService,
        private productService: ProductsService,
        private sendbirdService: SendBirdService,
        private prisma: PrismaService,
    ) {}
    private readonly logger = new Logger(ChatService.name);

    public async getOrCreateChat(createChat: CreateChatDto, buyerAccountId: string): Promise<Chat> {
        const { productId } = createChat;

        const product = await this.productService.getById(productId);

        if (buyerAccountId === product.sellerId) {
            throw new BadRequestException(`You cannot open a chat with yourself`);
        }

        const buyer = await this.accountsService.getById(buyerAccountId);
        const seller = await this.accountsService.getById(product.sellerId);

        const existingChat = await this.getProductChat(productId, seller.id, buyer.id);

        if (existingChat) {
            return new Chat(existingChat);
        }

        try {
            const sendbirdResponse = await this.sendbirdService.createUser({
                nickname: seller.name,
                user_id: seller.id,
                profile_url: seller.avatarUrl,
            });
            await this.accountsService.update(buyerAccountId, { sendBirdAccessToken: sendbirdResponse.accessToken });
        } catch (e) {
            //User already exist
        }

        const channelId = generateId();

        try {
            await this.sendbirdService.createProductChannel(channelId, seller.id, buyer.id);
        } catch (e) {
            throw new InternalServerErrorException('Could not create channel');
        }

        const chat = await this.prisma.chat.create({
            data: {
                id: channelId,
                url: channelId,
                buyerId: buyer.id,
                sellerId: seller.id,
                productId: productId,
            },
            include: { product: true, buyer: true, seller: true },
        });

        return new Chat(chat);
    }

    private async getProductChat(productId: string, sellerId: string, buyerId: string): Promise<Chat> {
        const chat = await this.prisma.chat.findFirst({
            where: {
                AND: [
                    {
                        productId,
                    },
                    {
                        sellerId,
                    },
                    {
                        buyerId,
                    },
                ],
            },
            include: { order: true, product: true, buyer: true, seller: true },
        });
        if (!chat) return null;

        return new Chat(chat);
    }

    public async getById(id: string): Promise<Chat> {
        const chat = await this.prisma.chat.findUnique({
            where: {
                id,
            },
            include: { order: true, product: true, buyer: true, seller: true },
        });

        if (!chat) throw new NotFoundException(`Chat with id ${id} not found`);

        return new Chat(chat);
    }

    public async findAll(params: {
        where?: Prisma.ChatWhereInput;
        orderBy?: Prisma.ChatOrderByWithRelationAndSearchRelevanceInput;
    }): Promise<Chat[]> {
        const chats = await this.prisma.chat.findMany({
            ...params,
            include: { order: true, product: true, buyer: true, seller: true },
        });

        const accountId = params.where?.OR[0].buyerId || params.where?.OR[0].sellerId;

        try {
            const sendbirdChats = await this.sendbirdService.getChatsForUser(accountId);
            const ourChatsWithSendbirdChats = chats
                .map((chat) => {
                    const sendbirdChat = sendbirdChats.find((sc) => sc.channel_url === chat.id);

                    if (sendbirdChat) {
                        return new Chat({
                            ...chat,
                            lastMessage: {
                                message: sendbirdChat.last_message?.message,
                                createdAt: sendbirdChat.last_message?.created_at,
                            },
                            unreadMessageCount: sendbirdChat.unread_message_count,
                        });
                    }
                })
                .filter((c) => c);
            return ourChatsWithSendbirdChats.sort((a, b) => {
                const lastMessageA = a.lastMessage.createdAt;
                const lastMessageB = b.lastMessage.createdAt;
                if (!lastMessageA || !lastMessageB) return 1;
                if (lastMessageB < lastMessageA) {
                    return -1;
                }
                if (lastMessageB > lastMessageA) {
                    return 1;
                }
                return 0;
            });
        } catch (error) {
            // User does not have a sendbird account
            if (error.response.data.code === 400201) {
                this.logger.error(`Sendbird failed to fetch user because it does not exist`);

                const account = await this.accountsService.getById(accountId);

                await this.sendbirdService.createUser({
                    nickname: account.name,
                    user_id: account.id,
                    profile_url: account.avatarUrl,
                });

                this.logger.log(`User created in sendbird successfully`);
            }

            return [];
        }
    }
}
