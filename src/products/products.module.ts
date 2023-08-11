import { Module } from '@nestjs/common';
import { PrismaService } from '../shared/services/prisma.service';
import { UsersModule } from '../user/user.module';
import { ProductsService } from './products.service';
import { AuthModule } from '../auth/auth.module';
import { ProductsController } from './controllers/products.controller';
import { Auth0Service } from '../shared/services/auth0.service';
import { CurrenciesService } from '../currencies/currencies.service';
import { SendBirdService } from '../shared/services/sendbird.service';
import { BrandsService } from './brands.service';
import { ModelsService } from './models.service';
import { CategoriesService } from './categories.service';
import { ModelsController } from './controllers/models.controller';
import { BrandsController } from './controllers/brands.controller';
import { CategoriesController } from './controllers/categories.controller';
import { MyProductsController } from './controllers/products.me.controller';
import { AdminProductsController } from './controllers/products.admin.controller';
import { AdminBrandsController } from './controllers/brands.admin.controller';
import { AdminModelsController } from './controllers/models.controller.admin';
import { AdminCategoriesController } from './controllers/categories.controller.admin';
import { OpensearchService } from '../shared/services/opensearch.service';

@Module({
    imports: [AuthModule, UsersModule],
    controllers: [
        MyProductsController,
        AdminProductsController,
        ProductsController,
        AdminBrandsController,
        BrandsController,
        AdminModelsController,
        ModelsController,
        AdminCategoriesController,
        CategoriesController,
    ],
    providers: [
        PrismaService,
        ProductsService,
        Auth0Service,
        SendBirdService,
        CurrenciesService,
        BrandsService,
        ModelsService,
        CategoriesService,
        OpensearchService,
    ],
    exports: [ProductsService],
})
export class ProductsModule {}
