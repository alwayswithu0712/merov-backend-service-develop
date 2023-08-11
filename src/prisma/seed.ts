import { OrderStatus, PrismaClient } from '@prisma/client';
import { generateId } from '../shared/helpers/id';
import { Blockchain, Currency, Permission } from '../shared/typings';
import { accounts } from './data/accounts';
import { deliveryAddresses } from './data/addresses';
import { products, productsJsbit, productsHome } from './data/products';
import { categories } from './data/categories';
import { brands } from './data/brands';
import { models } from './data/models';
import { users } from './data/users';
import { wallets } from './data/wallets';
import { organizations, members } from './data/organizations';
import * as SendbirdApi from './sendbird';
import axios from 'axios';
import { Auth0Service } from '../shared/services/auth0.service';
import { GetAWSSecrets } from '../shared/services/aws-secrets.service';

const priceCache = {};

const opensearch = {
    apiUrl: process.env.OPENSEARCH_ENDPOINT,
    user: process.env.OPENSEARCH_USERNAME,
    password: process.env.OPENSEARCH_PASSWORD,
    basicKey: () => Buffer.from(`${opensearch.user}:${opensearch.password}`).toString('base64'),
    headers: () => {
        const auth = opensearch.basicKey();
        console.log(auth);
        return {
            'Content-Type': 'application/json',
            Authorization: `Basic ${opensearch.basicKey()}`,
        };
    },
    createIndex: async (indexName: string) => {
        await axios.put(`https://${process.env.OPENSEARCH_ENDPOINT}/${indexName}`, {}, { headers: opensearch.headers() });
    },
    deleteIndex: async (indexName: string) => {
        await axios.delete(`https://${process.env.OPENSEARCH_ENDPOINT}/${indexName}`, { headers: opensearch.headers() });
    },

    add: async (indexName: string, data: any) => {
        await axios.put(`https://${process.env.OPENSEARCH_ENDPOINT}/${indexName}/_doc/${data.id}`, data, { headers: opensearch.headers() });
    },
};

function isUsd(currency: Currency): boolean {
    return currency === Currency.USDT || currency === Currency.USDC;
}

async function wait(ms: number) {
  return new Promise((resolve, reject) => setTimeout(resolve, ms))
}

function getCoingeckoId(currency: Currency): string {
    switch (currency) {
        case Currency.BTC:
            return 'bitcoin';
        case Currency.ETH:
            return 'ethereum';
        case Currency.MATIC:
            return 'matic-network';
        case Currency.BNB:
            return 'binancecoin';
        default:
            throw new Error(`Unsupported currency: ${currency}`);
    }
}

const getRate = async (currency): Promise<number> => {
    const value = await priceCache[currency];

    if (value) {
        return value;
    }

    if (isUsd(currency)) return 1;

    const coingeckoId = getCoingeckoId(currency);

    const { data } = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoId}&vs_currencies=usd`);
    priceCache[currency] = data[coingeckoId].usd;
    return data[coingeckoId].usd;
};

const clean = async (): Promise<void> => {
    console.log('Cleaning up database');
    await prisma.orderReview.deleteMany({});
    await prisma.orderUpdate.deleteMany({});
    await prisma.chat.deleteMany({});
    await prisma.dispute.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.offer.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.subcategory.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.address.deleteMany({});
    await prisma.wallet.deleteMany({});
    await prisma.invitation.deleteMany({});

    await prisma.account.deleteMany({});
    await prisma.organization.deleteMany({});
    await prisma.identityVerification.deleteMany({});
    await prisma.user.deleteMany({});

    // Careful: Sendbird is shared between all environments
    // await SendbirdApi.deleteAllChannels();
};

const jsbitAuthId = 'auth0|62cdd3fb3bdcf11ff5dbf30e';
const homeProductsAuthId = 'auth0|62cedfb83bdcf11ff5dc241e';

const jsbitAccountId = 'bda9fa06-0724-483a-8e48-db46be3b39fb';
const homeProductsAccountId = '171a5638-37ba-445c-92a3-621c7c200cb5';

const isJsbitOrHome = (id: string) => {
    return id === jsbitAccountId || id === homeProductsAccountId;
};

function randomEnum<T>(anEnum: T): T[keyof T] {
    const enumValues = Object.keys(anEnum)
        .map((n) => Number.parseInt(n))
        .filter((n) => !Number.isNaN(n)) as unknown as T[keyof T][];
    const randomIndex = Math.floor(Math.random() * enumValues.length);
    const randomEnumValue = enumValues[randomIndex];
    return randomEnumValue;
}

const generateRandomPrice = async () => {
    const currencies = [Currency.USDC, Currency.USDT];
    const currency = currencies[Number(randomEnum(currencies))];
    // const maxPrice = currency === Currency.ETH ? 0.1 : 100;
    const minPrice = 500;
    const maxPrice = 5000;
    // const chain = currency === Currency.MATIC ? Blockchain.Polygon : Blockchain.Ethereum;
    const chain = Blockchain.Ethereum;
    // const price = Number((Math.random() * maxPrice).toFixed(2));
    const price = Math.floor(Math.random() * (maxPrice - minPrice + 1)) + minPrice;

    const exchangeRate = await getRate(currency);
    const priceInUsd = price * exchangeRate;

    return {
        chain,
        currency,
        price,
        priceInUsd,
    };
};

const generateRandomCategories = () => {
    const shuffled = [...categories].sort(() => 0.5 - Math.random());

    return shuffled.slice(0, 3);
};

const prisma = new PrismaClient();

async function main() {
    await GetAWSSecrets();
    await clean();

    console.log('Creating categories');

    for (const category of categories) {
        const subcategoryData = category.subcategories.map((subcategory) => {
            return {
                id: generateId(),
                wallapopId: subcategory.id ? Number(subcategory.id) : undefined,
                name: subcategory.name,
            };
        });

        await prisma.category.create({
            data: {
                id: generateId(),
                wallapopId: category.id ? Number(category.id) : undefined,
                fields: {
                    brand: category.fields?.brand,
                    model: category.fields?.model,
                },
                name: category.name,
                subcategories: {
                    createMany: {
                        data: subcategoryData,
                    },
                },
            },
            include: { subcategories: true },
        });
    }

    console.log('Creating accounts');

    await prisma.account.createMany({
        data: accounts,
    });

    let newAccounts = await prisma.account.findMany({});

    for (const account of newAccounts) {
        let sendbirdUser = await SendbirdApi.getUserById(account.id);

        if (!sendbirdUser) {
            sendbirdUser = await SendbirdApi.createUser({
                user_id: account.id,
                nickname: account.name,
                profile_url: account.avatarUrl,
            });
            console.log(`SendbirdUser ${sendbirdUser.id} created`);
        }

        account.sendBirdAccessToken = sendbirdUser.access_token;
    }

    console.log('Creating users');
    for (let index = 0; index < users.length; index++) {
        users[index].accountId = newAccounts[index].id;
    }
    await prisma.user.createMany({
        data: users,
    });

    console.log('Creating organizations');
    organizations[0].accountId = jsbitAccountId; // jsbit
    organizations[1].accountId = homeProductsAccountId; // home products
    await prisma.organization.createMany({
        data: organizations,
    });
    console.log('Creating organizations members');
    await prisma.user.createMany({
        data: members,
    });

    console.log('Permission assignment');
    const auth0Service = new Auth0Service();
    const createdUsers = await prisma.user.findMany({});
    const noOrgUsers = createdUsers.filter((user) => [homeProductsAccountId, jsbitAccountId].indexOf(user.accountId) < 0);
    const orgUsers = createdUsers.filter((user) => [homeProductsAccountId, jsbitAccountId].indexOf(user.accountId) > -1);

    // Users with no Org are Owners
    await Promise.all(noOrgUsers.map(async u => {
        console.log(`Assigning Owner permissions to ${u.id} (${u.email})`);
        await wait(1.5 * Math.random() * 1000)
        return auth0Service.addPermissions(u.authId, [Permission.Owner]);
    }))

    // Owners
    await Promise.all(
        orgUsers.filter(u => [jsbitAuthId, homeProductsAuthId].indexOf(u.authId) > -1).map(async u => {
            console.log(`Assigning Owner permissions to ${u.id} (${u.email})`);
            await wait(1.5 * Math.random() * 1000)
            return auth0Service.addPermissions(u.authId, [Permission.Owner]);
        })
    )

    // Members
    await Promise.all(orgUsers.map(async u => {
        console.log(`Assigning Admin permissions to member ${u.id} (${u.email})`);
        await wait(1.5 * Math.random() * 1000)
        return auth0Service.addPermissions(u.authId, [Permission.Admin]);
    }))

    console.log('Setting Auth0 app metadata');
    for (let u of createdUsers) {
        console.log(`Assigning app_metadata to ${u.id} (${u.email})`);
        await wait(1.0 * Math.random() * 1000)
        await auth0Service.patch(u.authId, {app_metadata: {
            userId: u.id,
            accountId: u.accountId
        }})
    }


    console.log('Creating wallets and addresses');

    const subcategories = await prisma.subcategory.findMany({});

    const addressesData = [];
    const walletsData = [];
    const productsData = [];

    for (const account of newAccounts) {
        for (const address of deliveryAddresses) {
            addressesData.push({
                ...address,
                accountId: account.id,
            });
        }

        for (const wallet of wallets) {
            walletsData.push({
                ...wallet,
                accountId: account.id,
            });
        }
    }

    console.log('Creating addresses');
    await prisma.address.createMany({ data: addressesData });

    console.log('Creating wallets');
    await prisma.wallet.createMany({ data: walletsData });

    console.log('Creating brands');
    const brandsData = brands
        .map((brand) => {
            const subcategory = subcategories.find((sub) => sub.wallapopId === Number(brand.subcategoryId));

            if (!subcategory) return;

            return {
                categoryId: subcategory.categoryId,
                subcategoryId: subcategory.id,
                name: brand.name,
                approved: true,
            };
        })
        .map((b) => b);

    await prisma.brand.createMany({ data: brandsData });

    console.log('Creating models');
    for (const m of models) {
        const subcategory = subcategories.find((sub) => sub.wallapopId === Number(m.subcategoryId));

        if (!subcategory) return;

        const modelsData = m.models
            .map((model) => {
                return {
                    categoryId: subcategory.categoryId,
                    subcategoryId: subcategory.id,
                    brand: m.brand,
                    name: model,
                    approved: true,
                };
            })
            .map((m) => m);

        await prisma.model.createMany({ data: modelsData });
    }

    console.log('Deleting all products in opensearch index');
    await opensearch.deleteIndex('product');

    console.log('Creating new product index');
    await opensearch.createIndex('product');

    console.log('Creating products');
    for (const account of newAccounts.filter(a => !isJsbitOrHome(a.id))) {
        const [deliveryAddress] = await prisma.address.findMany({ where: { accountId: account.id } });
        for (const product of products) {
            const randomSubcategory = subcategories[Math.floor(Math.random() * subcategories.length)];

            const randomPrice = await generateRandomPrice();

            productsData.push({
                ...product,
                id: generateId(),
                sellerAddress: wallets[0].address,
                ...randomPrice,
                seller: {
                    connect: {
                        id: account.id,
                    },
                },
                category: {
                    connect: {
                        id: randomSubcategory.categoryId,
                    },
                },
                subcategory: {
                    connect: {
                        id: randomSubcategory.id,
                    },
                },
                deliveryAddress: {
                    connect: {
                        id: deliveryAddress.id,
                    },
                },
            });
        }
    }

    console.log('Creating jsbit products');
    const [jsbitProductDeliveryAddress] = await prisma.address.findMany({ where: { accountId: jsbitAccountId } });
    const jsbitProducts = await Promise.all(
        productsJsbit.map(async (product) => {
            const randomSubcategory = subcategories[Math.floor(Math.random() * subcategories.length)];
            const randomPrice = await generateRandomPrice();

            return {
                ...product,
                id: generateId(),
                sellerAddress: wallets[0].address,
                ...randomPrice,
                seller: {
                    connect: {
                        id: jsbitAccountId,
                    },
                },
                category: {
                    connect: {
                        id: randomSubcategory.categoryId,
                    },
                },
                subcategory: {
                    connect: {
                        id: randomSubcategory.id,
                    },
                },
                deliveryAddress: {
                    connect: {
                        id: jsbitProductDeliveryAddress.id,
                    },
                },
            };
        }),
    );

    console.log('Creating home products');
    const [homeProductDeliveryAddress] = await prisma.address.findMany({ where: { accountId: homeProductsAccountId } });
    const homeProducts = await Promise.all(
        productsHome.map(async (product) => {
            const randomSubcategory = subcategories[Math.floor(Math.random() * subcategories.length)];
            const randomPrice = await generateRandomPrice();
            return {
                ...product,
                id: generateId(),
                sellerAddress: wallets[0].address,
                ...randomPrice,
                seller: {
                    connect: {
                        id: homeProductsAccountId,
                    },
                },
                category: {
                    connect: {
                        id: randomSubcategory.categoryId,
                    },
                },
                subcategory: {
                    connect: {
                        id: randomSubcategory.id,
                    },
                },
                deliveryAddress: {
                    connect: {
                        id: homeProductDeliveryAddress.id,
                    },
                },
            };
        }),
    );

    for (let i = 0; i < productsData.length; i++) {
        console.log(`Creating product ${i + 1}/${productsData.length + 1}`);
        const p = await prisma.product.create({ data: productsData[i], include: { seller: true, orders: true } });
        console.log({ p });
        await opensearch.add('product', p);
    }

    for (let i = 0; i < jsbitProducts.length; i++) {
        console.log(`Creating product ${i + 1}/${jsbitProducts.length + 1}`);
        await prisma.product.create({ data: jsbitProducts[i] });
        await opensearch.add('product', jsbitProducts[i]);
    }

    for (let i = 0; i < homeProducts.length; i++) {
        console.log(`Creating product ${i + 1}/${homeProducts.length + 1}`);
        await prisma.product.create({ data: homeProducts[i] });
        await opensearch.add('product', homeProducts[i]);
    }

    const productsFromDB = await prisma.product.findMany({
        include: { category: true, subcategory: true, seller: true, orders: true },
    });

    const ordersData = [];

    for (const account of newAccounts) {
        const randomProducts = productsFromDB
            .filter((product) => product.sellerId !== account.id)
            .sort(() => Math.random() - 0.5)
            .slice(0, 40);

        for (const productDB of randomProducts) {
            ordersData.push({
                id: generateId(),
                shippingToCity: deliveryAddresses[0].city,
                shippingToCountry: deliveryAddresses[0].country,
                shippingToPostcode: deliveryAddresses[0].postcode,
                shippingToAddressName: deliveryAddresses[0].name,
                shippingToState: deliveryAddresses[0].state,
                shippingToStreet: deliveryAddresses[0].street,
                buyerPhone: deliveryAddresses[0].phone,
                shippingFromCity: deliveryAddresses[1].city,
                shippingFromCountry: deliveryAddresses[1].country,
                shippingFromPostcode: deliveryAddresses[1].postcode,
                shippingFromState: deliveryAddresses[1].state,
                shippingFromStreet: deliveryAddresses[1].street,
                sellerPhone: deliveryAddresses[1].phone,
                price: productDB.price,
                quantity: 1,
                total: productDB.price,
                sellerAddress: wallets[0].address,
                chain: productDB.chain,
                currency: productDB.currency,
                status: OrderStatus.Created,
                productId: productDB.id,
                buyerId: account.id,
                sellerId: productDB.sellerId,
                maxTimeToDisputeInDays: 7,
                maxShippingDurationInDays: 7,
            });
        }
    }

    console.log('Creating orders');

    await prisma.order.createMany({
        data: ordersData,
    });

    const orders = await prisma.order.findMany({
        include: {
            product: true,
            seller: true,
            buyer: true,
            reviews: true,
        },
    });

    const reviewsData = [];

    for (const order of orders) {
        const review = {
            rating: Math.max(Math.floor(Math.random() * 5) + 2, 5),
            review: `Amazing product! I love it! I will buy it again! :) @${order.buyer.name}`,
            reviewerId: order.buyerId,
            revieweeId: order.sellerId,
            orderId: order.id,
            reviewerAvatarUrl: order.buyer.avatarUrl,
        };

        reviewsData.push(review);
    }

    console.log('Creating reviews');
    await prisma.orderReview.createMany({
        data: reviewsData,
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
