export interface ProveAuthUrlDto {
    sessionId: string;
    ipAddress: string;
    phone: string;
}

export interface ProveAuthUrlResponse {
    RequestId: string;
    Status: number;
    Description: string;
    Response: {
        AuthenticationUrl: string;
        MobileOperatorName: string;
    };
}

export interface ProveInstantLinkResultDto {
    sessionId: string;
    vfp: string;
}

export interface ProveInstantLinkResult {
    RequestId: string;
    Status: number;
    Description: string;
    Response: {
        LinkClicked: boolean;
        PhoneMatch: boolean;
        IpAddressMatch: boolean;
        SessionId: string;
    };
}

export interface ProveTrustDto {
    phone: string;
}

export interface ProveTrustResponse {
    requestId: string;
    status: number;
    description: string;
    response: {
        transactionId: string;
        payfoneAlias: string;
        phoneNumber: string;
        lineType: string;
        carrier: string;
        countryCode: string;
        statusIndex: string;
        isBaselined: string;
        trustScore: number;
        reasonCodes: string[];
        phoneNumberVelocity: number;
        portVelocity: number;
        payfoneTenure: Object[];
        phoneNumberTenure: Object[];
    };
}

export interface ProveIdentityDto {
    phone: string;
    dateOfBirth: Date;
}

export interface ProveIdentityResponse {
    requestId: string;
    status: number;
    description: string;
    response: {
        transactionId: string;
        phoneNumber: string;
        lineType: string;
        carrier: string;
        countryCode: string;
        reasonCodes: string[];
        individual: {
            firstName: string;
            lastName: string;
            addresses: {
                address: string;
                extendedAddress: string;
                city: string;
                region: string;
                postalCode: string;
            }[];
            emailAddresses: string[];
            ssn: string;
            dob: string;
        };
    };
}

export interface ProveVerifyDto {
    phone: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    address: string;
    city: string;
    region: string;
    postalCode: string;
    ssn?: string;
}

export interface ProveVerifyResponse {
    requestId: string;
    status: number;
    description: string;
    response: {
        verified: boolean;
        transactionId: string;
        payfoneAlias: string;
        phoneNumber:  string;
        lineType: string;
        carrier: string;
        countryCode: string;
        name: { firstName: number, lastName: number, nameScore: number },
        address: {
          streetNumber: number,
          street: boolean;
          city: boolean;
          region: boolean;
          postalCode: boolean;
          distance: number;
          addressScore: number;
        },
        identifiers: { ssn: boolean },
        cipConfidence: string,
        reasonCodes: string[],
    }
}

export interface ProveVerificationStartDto {
    sessionId: string;
    userId: string;
}