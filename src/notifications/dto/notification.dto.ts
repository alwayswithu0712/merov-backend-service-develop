export class NotificationDto {
    userId: string;
    title: string;
    message?: string;
    metadata?: Record<string, unknown>;
    createdAt: Date;
    readAt?: Date;
    type: string;
}
