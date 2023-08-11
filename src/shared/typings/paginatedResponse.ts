export interface PaginatedResponse<A> {
    pageCount: number;
    pageSize: number;
    totalCount: number;
    currentPage: number;
    next: number | null;
    previous: number | null;
    response: Array<A>;
}

export function toPaginatedResponse<A>(response: Array<A>, count: number, skip: number, take: number): PaginatedResponse<A> {
    return {
        pageCount: Math.ceil(count / take),
        pageSize: take,
        totalCount: count,
        currentPage: skip === 0 ? 1 : Math.floor(skip / take) + 1,
        next: take + skip < count ? take + skip : null,
        previous: skip > 0 ? skip - take : null,
        response: response,
    };    
}
