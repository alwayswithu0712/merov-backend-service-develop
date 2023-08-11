import { Inject, Injectable, Logger } from '@nestjs/common';
import { DynamoDB } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import { AwsConfig } from '../config/config.interface';
import { NotificationDto } from './dto/notification.dto';
import {generateId} from "../shared/helpers/id";
import { ServerEventsService } from '../server-events/server-events.service';
import { FirebaseService } from './firebase.service';
@Injectable()
export class NotificationsService {
    
    private readonly dynamodb: DynamoDB.DocumentClient;
    private readonly tableName: string;

    private logger = new Logger('NotificationsService');

    constructor(
        @Inject(ServerEventsService) private readonly eventsService: ServerEventsService,
        private readonly configService: ConfigService,
        private readonly firebaseService: FirebaseService) {
        const awsConfig = this.configService.get<AwsConfig>('aws');

        this.dynamodb = new DynamoDB.DocumentClient({
            region: awsConfig.region,
        });

        this.tableName = awsConfig.dynamodb.table;

    }

    // get all notifications for a user
    public async getAll(userId: string): Promise<NotificationDto[]> {
        const params = {
            TableName: this.tableName,
            ExpressionAttributeValues: {
                ':partitionKey': userId,
                ':sortKey': 'NOTIFICATION#',
            },
            KeyConditionExpression: 'partitionKey = :partitionKey AND begins_with(sortKey,:sortKey)',
        }

        const result = await this.dynamodb.query(params).promise();

        return result.Items.map(this.toNotificationDto);
    }

    public async markAsRead(userId: string, notificationId: string) {
        const readAt = (new Date()).toISOString();
        const params = {
            TableName: this.tableName,
            Key: {
                partitionKey: userId,
                sortKey: `NOTIFICATION#${notificationId}`,
            },
            AttributeUpdates: {
                readAt: {
                    Value: readAt,
                },
            }
        }
        
        await this.dynamodb.update(params).promise();

        this.eventsService.add(userId, {
            id: notificationId,
            readAt,
            type: 'notification.read'
        })
    }

    public async getUnread(userId: string): Promise<NotificationDto[]> {
        const params = {
            TableName: this.tableName,
            ExpressionAttributeValues: {
                ':partitionKey': userId,
                ':sortKey': 'NOTIFICATION#',
                ':readAt': 'NEVER',
            },
            KeyConditionExpression: 'partitionKey = :partitionKey AND begins_with(sortKey,:sortKey)',
            FilterExpression: 'readAt = :readAt',
        }

        const result = await this.dynamodb.query(params).promise();
        return result.Items.map(this.toNotificationDto);
    }

    public async getUnreadCount(userId: string): Promise<number> {
        const params = {
            TableName: this.tableName,
            ExpressionAttributeValues: {
                ':partitionKey': userId,
                ':sortKey': 'NOTIFICATION#',
                ':readAt': 'NEVER',
            },
            Select: 'COUNT',
            KeyConditionExpression: 'partitionKey = :partitionKey AND begins_with(sortKey,:sortKey)',
            FilterExpression: 'readAt = :readAt',
        }

        const result = await this.dynamodb.query(params).promise();
        return result.Count;
    }

    // create a new notification for a user
    public async create(userId: string, data: NotificationDto) {
        const id = generateId();
        const params = {
            TableName: this.tableName,
            Key: {
                partitionKey: userId,
                sortKey: `NOTIFICATION#${id}`,
            },
            Item: {
                ...data,
                partitionKey: userId,
                sortKey: `NOTIFICATION#${id}`,
                id: id,
                createdAt: new Date().toISOString(),
                readAt: 'NEVER',
            },
        };

        await this.dynamodb.put(params).promise();

        this.eventsService.add(userId, this.toNotificationDto({
            id,
            ...data
        }));

        await this.firebaseService.send(userId, data);
    }

    private toNotificationDto(item: DynamoDB.DocumentClient.AttributeMap): NotificationDto {
        const notification = {
            ...item,
        };

        delete notification.partitionKey;
        delete notification.sortKey;

        notification.readAt = notification.readAt === 'NEVER' ? null : new Date(notification.readAt);

        return notification as NotificationDto;
    }
}
