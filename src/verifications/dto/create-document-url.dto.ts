export interface CreateDocumentUrlDto {
    firstName?: string;
    lastName?: string;
    address?: {
        street1?: string;
        street2?: string;
        city?: string;
        region?: string;
        postalCode?: string;
        countryCode?: string;
    }
}