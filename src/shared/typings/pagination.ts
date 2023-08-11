export interface Pagination {
    skip?: number;
    take?: number;
    orderBy?: { [field: string]: 'asc' | 'desc' };
    where?: Record<string,unknown>;
}
