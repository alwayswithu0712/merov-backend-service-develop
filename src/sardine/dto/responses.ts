export interface SardineCustomersResponse {
    sessionKey: string;
    level: string;
    status: string;
    customer: {
        score: number;
        level: string;
        reasonCodes: string[];
        signals: {
            key: string;
            value: string;
            reasonCodes: string[];
        }[];
        address: {
            validity: string;
        };
    };
    checkpoints: {
        customer: {
            customerPurchaseLevel: {
                value: string;
                ruleIds: number[];
            }
            ;
            emailLevel: {
                value: string;
                ruleIds: number[];
            };
            historicalLevel: {
                value: string;
                ruleIds: number[];
            };
            riskLevel: {
                value: string;
                ruleIds: number[];
            };
        };
    };
    rules: {
        id: number;
        isLive: boolean;
        isAllowlisted: boolean;
    }[];
}

export interface SardineVerificationUrlResponse {
    id: string;
    link: {
        expiresAt: string;
        url: string;
    }
}

export interface SardineTokenResponse {
    token_type: string;
    expires_in: string;
    access_token: string;
    incode_sdk_base_url: string;
    verification_id: string;
    scope: string;
}