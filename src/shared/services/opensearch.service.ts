import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { SearchProductsDto } from '../../products/dto/search-products.dto';
import { PaginatedResponse } from '../typings/paginatedResponse';
import { Product } from '../../products/dto/product';
import { OpenSearchConfig } from 'src/config/config.interface';

@Injectable()
export class OpensearchService {
    private readonly logger = new Logger(OpensearchService.name);

    constructor(private readonly configService: ConfigService) {}

    private getHeaders() {
        const { username, password } = this.configService.get<OpenSearchConfig>('opensearch');
        const basicKey = Buffer.from(`${username}:${password}`).toString('base64');
        return {
            Authorization: `Basic ${basicKey}`,
            'Content-Type': 'application/json',
        };
    }

    async addProduct(product: Product): Promise<void> {
        const { endpoint } = this.configService.get<OpenSearchConfig>('opensearch');
        const request = `https://${endpoint}/product/_doc/${product.id}`;

        try {
            await axios.put(request, product, { headers: this.getHeaders() });
        } catch (error) {
            this.logger.warn(`Failed to add product to opensearch: ${error}`)
        }
    }

    async deleteProduct(productId: string): Promise<void> {
        const { endpoint } = this.configService.get<OpenSearchConfig>('opensearch');
        const request = `https://${endpoint}/product/_doc/${productId}`;

        try {
            await axios.delete(request, { headers: this.getHeaders() });
        } catch (error) {
            this.logger.warn(`Failed to delete product to opensearch: ${error}`)
        }
    }

    async searchProducts(params: SearchProductsDto): Promise<PaginatedResponse<Product>> {
        const { endpoint } = this.configService.get<OpenSearchConfig>('opensearch');
        const request = `https://${endpoint}/product/_search`;

        const query = [];
        const pagination = {};
        const baseSort = {};

        if (params.search) {
            query.push({
                multi_match: {
                    query: params.search,
                    fields: ['title^2', 'description'],
                    operator: 'or',
                    fuzziness: 'AUTO',
                },
            });
        }

        if (params.category) {
            query.push({
                term: {
                    category: params.category,
                },
            });
        }

        if (params.subCategories) {
            query.push({
                bool: {
                    should: params.subCategories.map((subCategory) => {
                        return {
                            match: {
                                subCategory: subCategory,
                            },
                        };
                    }),
                },
            });
        }

        if (params.currencies) {
            query.push({
                bool: {
                    should: params.currencies.map((currency) => {
                        return {
                            match: {
                                currency: currency,
                            },
                        };
                    }),
                },
            });
        }

        if (params.minPrice) {
            query.push({
                range: {
                    price: {
                        gte: params.minPrice,
                    },
                },
            });
        }

        if (params.maxPrice) {
            query.push({
                range: {
                    price: {
                        lte: params.maxPrice,
                    },
                },
            });
        }

        if (params.conditions) {
            query.push({
                bool: {
                    should: params.conditions.map((condition) => {
                        return {
                            match: {
                                condition: condition,
                            },
                        };
                    }),
                },
            });
        }

        if (params.brands) {
            query.push({
                bool: {
                    should: params.brands.map((brand) => {
                        return {
                            match: {
                                brand: brand,
                            },
                        };
                    }),
                },
            });
        }

        if (params.models) {
            query.push({
                bool: {
                    should: params.models.map((model) => {
                        return {
                            match: {
                                model: model,
                            },
                        };
                    }),
                },
            });
        }

        if (params.skip) {
            pagination['from'] = params.skip;
        }

        if (params.take) {
            pagination['size'] = params.take;
        }

        if (params.hasStock) {
            query.push({
                range: {
                    stock: {
                        gte: 1,
                    },
                },
            });
        }

        if (params.sort && params.sort.length > 0) {
            const uniqueSort = [...new Set(params.sort)];
            baseSort['sort'] = uniqueSort.map((sort) => {
                const [field, order] = sort.split('_');
                switch (field) {
                    case 'price':
                        return {
                            priceInUsd: {
                                order,
                            },
                        };
                    case 'created':
                        return {
                            createdAt: {
                                order,
                            },
                        };
                    default:
                        return {
                            createdAt: {
                                order,
                            },
                        };
                }
            });
        }

        const body = {
            ...pagination,
            query: {
                bool: {
                    must: query,
                },
            },
            ...baseSort,
        };

        return axios
            .get(request, {
                headers: this.getHeaders(),
                data: body,
            })
            .then((response) => {
                const data = response.data;
                return {
                    pageCount: 0,
                    pageSize: params.take,
                    totalCount: 0,
                    currentPage: 0,
                    next: null,
                    previous: null,
                    response: data.hits.hits.map((hit) => hit._source),
                };
            });
    }
}
