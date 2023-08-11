export interface MiddeskBusiness {
    object: string;
    id: string;
    external_id: null;
    name: string;
    created_at: Date;
    updated_at: Date;
    status: string;
    tags: any[];
    requester: null;
    assignee_id: string;
    supported_document_types: any[];
    review: Review;
    tin: null;
    business_batch_id: null;
    formation: null;
    website: null;
    watchlist: Watchlist;
    bankruptcies: any[];
    certifications: any[];
    documents: any[];
    liens: any[];
    names: Name[];
    addresses: BusinessAddress[];
    people: any[];
    phone_numbers: any[];
    profiles: any[];
    registrations: any[];
    orders: Order[];
    industry_classification: null;
    subscription: null;
    tax_exempt_organization: null;
    fmcsa_registrations: any[];
    actions: Action[];
    submitted: Submitted;
}

interface Action {
    id: string;
    type_of: string;
    author: string;
    rule_set: null;
    note: string;
    reason: null;
    metadata: Metadata;
    created_at: Date;
    updated_at: Date;
}

interface Metadata {
    current_status: string;
    previous_status: string;
}

interface BusinessAddress {
    object: string;
    address_line1: string;
    address_line2: null;
    city: string;
    state: string;
    postal_code: string;
    full_address: string;
    submitted: boolean;
    id: string;
    latitude: number;
    longitude: number;
    property_type: null;
    deliverable: boolean;
    deliverability_analysis: null;
    street_view_available: boolean;
    labels: any[];
    created_at: Date;
    updated_at: Date;
    registered_agent_name: null;
    cmra: boolean;
    business_id: string;
    sources: any[];
}

interface Name {
    object: string;
    id: string;
    name: string;
    submitted: boolean;
    type: string;
    business_id: string;
    sources: any[];
}

interface Order {
    object: string;
    id: string;
    created_at: Date;
    updated_at: Date;
    completed_at: Date;
    status: string;
    product: string;
    subproducts: any[];
}

interface Review {
    object: string;
    id: string;
    created_at: Date;
    updated_at: Date;
    completed_at: Date;
    tasks: Task[];
    assignee: Assignee;
}

interface Assignee {
    object: string;
    id: string;
    name: string;
    email: string;
    roles: string[];
    image_url: string;
    last_login_at: Date;
    settings: Settings;
}

interface Settings {
    receives_agent_emails: boolean;
}

interface Task {
    category: string;
    key: string;
    label: string;
    message: string;
    name: string;
    status: string;
    sub_label: string;
    sources: any[];
}

interface Submitted {
    object: string;
    name: string;
    addresses: SubmittedAddress[];
    orders: null;
    people: any[];
    phone_numbers: null;
    tags: null;
    external_id: null;
    tin: null;
    website: null;
    assignee_id: null;
    formation: null;
    names: null;
}

interface SubmittedAddress {
    submitted: boolean;
    full_address: string;
}

interface Watchlist {
    object: string;
    id: string;
    hit_count: number;
    agencies: Agency[];
    lists: List[];
    people: any[];
}

interface Agency {
    abbr: string;
    name: string;
    org: string;
}

interface List {
    object: string;
    agency: string;
    agency_abbr: string;
    organization: string;
    title: string;
    abbr: string;
    results: any[];
}
