import * as env from 'dotenv';
import { Config } from './config.interface';

env.config();

// FTX Blockchain confirmation(s):
// Token	Confirmation(s) Required
// BTC	2
// ETH	10
// USDT (ERC20)    	10
// BNB	1

const config = () => ({
    nest: {
        // port: Number(process.env.PORT) || 3001,
        port: 3001,
    },
    env: {
        isProduction: process.env.NODE_ENV === 'production',
        isDevelopment: process.env.NODE_ENV === 'develop',
        isTestEnvironment: process.env.NODE_ENV === 'test',
        name: process.env.NODE_ENV,
    },
    logger: {
        maxFiles: 5,
        maxFileSize: 20971520, // 20 MB
        zipOldLogs: true,
        fileName: 'merov-backend-service.log',
        name: 'merov-backend-service',
    },
    merov: {
        url: process.env.MEROV_DOMAIN,
        defaultMinTestingTime: 0,
        defaultMaxTestingTime: 3,
        product: { minPrice: 100 },
        order: {
            defaultMaxTimeToDisputeInDays: 7,
            defaultMaxShippingDurationInDays: 7,
        },
    },
    aws: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION,
        cloudfront: {
            url: 'https://d1slha89a3rmvx.cloudfront.net/',
        },
        s3: {
            bucket: process.env.AWS_IMAGES_BUCKET_NAME,
        },
        dynamodb: {
            table: process.env.AWS_DYNAMODB_TABLE,
        },
    },
    auth0: {
        audience: process.env.AUTH0_AUDIENCE,
        merovAudience: process.env.AUTH0_MEROV_AUDIENCE,
        issuerBaseUrl: process.env.AUTH0_ISSUER_BASE_URL,
    },
    sendbird: {
        appId: process.env.SENDBIRD_APP_ID,
        apiToken: process.env.SENDBIRD_API_TOKEN,
    },
    slack: {
        token: process.env.SLACK_BOT_TOKEN,
    },
    kyc: {
        notifyTo: process.env.NODE_ENV === 'production' ? 'merovcompliance@decise.io' : 'nico@merov.io',
    },
    backoffice: {
        url: process.env.NODE_ENV === 'production' ? 'https://backoffice.merov.io' : `https://${process.env.NODE_ENV}.backoffice.merov.io`,
    },
    prove: {
        apiUrl: process.env.PROVE_API_URL,
        clientId: process.env.PROVE_CLIENT_ID,
        username: process.env.PROVE_USERNAME,
        password: process.env.PROVE_PASSWORD,
        identityClientId: process.env.PROVE_IDENTITY_CLIENT_ID,
        identityUsername: process.env.PROVE_IDENTITY_USERNAME,
        identityPassword: process.env.PROVE_IDENTITY_PASSWORD,
    },
    sardine: {
        apiUrl: process.env.SARDINE_API_URL,
        signingSecret: process.env.SARDINE_SIGNATURE_KEY,
    },
    twilio: {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
    },
    opensearch: {
        endpoint: process.env.OPENSEARCH_ENDPOINT,
        username: process.env.OPENSEARCH_USERNAME,
        password: process.env.OPENSEARCH_PASSWORD,
    },
    middesk: {
        apiUrl: process.env.MIDDESK_API_URL,
        accessKey: process.env.MIDDESK_ACCESS_KEY,
    },
});

export default (): Config => config();
