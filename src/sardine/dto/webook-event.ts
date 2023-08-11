import { SardineVerificationResult } from "./verification-result";

export interface SardineWebhookEvent {
    id: string;
    type: string;
    timestamp: string;
    data: {
        action: {
            source: string;
            user_email?: string;
            value?: string;
        };
        case: {
            sessionKey: string;
            customerID: string;
            status?: string;
            checkpoint?: string;
            transactionID?: string;
        };
    };
    documentVerificationResult: SardineVerificationResult;
}