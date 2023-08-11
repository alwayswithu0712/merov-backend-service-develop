import { OrderStatus } from '@prisma/client';

interface OrderUpdateInterface {
    buyerAddress?: string;
    trackingNumber?: string;
    maxShippingDurationInDays?: number;
    maxTimeToDisputeInDays?: number;
    shippingCost?: number;
    payinTxHash?: string;
    payoutTxHash?: string;
    sellerNotes?: string;
    disputeReason?: string;
    status: OrderStatus;
}
