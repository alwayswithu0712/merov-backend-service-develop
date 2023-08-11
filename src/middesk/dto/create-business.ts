export interface CreateMiddeskBusinessDto {
    tin: {
        tin: string;
    };
    website: {
        url: string;
    };
    addresses: MiddeskBusinessAddress[];
    name: string;
}

export interface MiddeskBusinessAddress {
    address_line1: string;
    city: string;
    state: string;
    postal_code: string;
}
