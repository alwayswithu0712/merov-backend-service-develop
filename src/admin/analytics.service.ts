import { Injectable } from "@nestjs/common";
import { PrismaService } from "../shared/services/prisma.service";
import * as moment from "moment";
import { OrderStatus } from "@prisma/client";

@Injectable()
export class AnalyticsService {
    constructor(
        private prisma: PrismaService,
    ) {

    }

    private async getAnalytics(table: { count: Function }, where: Record<string, unknown> = {}) {
        const total = await table.count({ where });

        const today = await table.count({
            where: {
                ...where,
                createdAt: {
                    gte:  moment().startOf('day').toDate(),
                    lte: moment().endOf('day').toDate(),
                }
            }
        });

        const yesterday = await table.count({
            where: {
                ...where,
                createdAt: {
                    gte: moment().subtract(1, 'days').startOf('day').toDate(),
                    lte: moment().subtract(1, 'days').endOf('day').toDate(),
                }
            }
        });

        const thisWeek = await table.count({
            where: {
                ...where,
                createdAt: {
                    gte: moment().startOf('week').toDate(),
                    lte: moment().endOf('week').toDate(),
                }
            }
        });

        return {
            total,
            today,
            yesterday,
            thisWeek,
        }
    }


    public async get() {
        const ordersByStatus = await Promise.all(Object.keys(OrderStatus).map(async (status) => ([
                status.toLocaleLowerCase(), await this.getAnalytics(this.prisma.order, { status }),
            ])));

        const orders = {
            total: await this.getAnalytics(this.prisma.order),
            ...Object.fromEntries(ordersByStatus),
        }

        const products = {
            total: await this.getAnalytics(this.prisma.product),
            approved: await this.getAnalytics(this.prisma.product, { approved: true }),
        }

        const offers = await this.getAnalytics(this.prisma.offer);

        const users = await this.getAnalytics(this.prisma.user);

        return {
            orders,
            products,
            offers,
            users,
        }
    }
}