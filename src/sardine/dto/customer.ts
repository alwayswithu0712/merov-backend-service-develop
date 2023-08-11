interface SardineAddress {
    street1: string;
    street2?: string;
    city: string;
    regionCode: string;
    postalCode: string;
    countryCode: string;
}

export interface SardineCustomer {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    dateOfBirth: Date;
    emailAddress: string;
    address?: SardineAddress;
}