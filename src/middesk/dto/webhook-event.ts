export interface MiddeskWebhookEvent {
    object: string;
    id: string;
    type: string;
    data: MiddeskWebhookEventData;
    created_at: Date;
}

export interface MiddeskWebhookEventData {
    object: {
        id: string;
        tin: null;
        name: string;
        tags: any[];
        names: any[];
        domain: null;
        object: string;
        review: null;
        status: string;
        orders: Order[];
        summary: null;
        website: null;
        officers: any[];
        addresses: any[];
        formation: null;
        watchlist: null;
        created_at: Date;
        updated_at: Date;
        external_id: null;
        phone_numbers: any[];
        registrations: any[];
    };
}

interface Order {
    id: string;
    object: string;
    status: string;
    product: string;
    created_at: Date;
    updated_at: Date;
    completed_at: null;
}
