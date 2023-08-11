export interface NestConfig {
    port: number;
}

export interface EnvConfig {
    name: string;
    isProduction: boolean;
    isDevelopment: boolean;
    isTestEnvironment: boolean;
}

export interface LoggerConfig {
    maxFiles: number;
    maxFileSize: number;
    zipOldLogs: boolean;
    fileName: string;
    name: string;
}

export interface AwsConfig {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    cloudfront: {
        url: string;
    };
    s3: {
        bucket: string;
    };
    dynamodb: {
        table: string;
    };
}

export interface TwilioConfig {
    accountSid: string;
    authToken: string;
}

export interface MerovConfig {
    url: string;
    defaultMinTestingTime: number;
    defaultMaxTestingTime: number;
    product: ProductConfig;
    order: OrderConfig;
}

export interface Auth0Config {
    audience: string; // audience requiered to access auth0 backend
    merovAudience: string; // audience requiered to access merov backend
    issuerBaseUrl: string;
}

export interface SendBirdConfig {
    appId: string;
    apiToken: string;
}

export interface SlackConfig {
    token: string;
}

export interface OrderConfig {
    defaultMaxTimeToDisputeInDays: number;
    defaultMaxShippingDurationInDays: number;
}

export interface OpenSearchConfig {
    endpoint: string;
    username: string;
    password: string;
}

export interface ProveConfig {
    apiUrl: string;
    clientId: string;
    username: string;
    password: string;
    identityClientId: string;
    identityUsername: string;
    identityPassword: string;
}

export interface SardineConfig {
    apiUrl: string;
    signingSecret: string;
}

export interface MiddeskConfig {
    apiUrl: string;
    accessKey: string;
}

export interface BackofficeConfig {
    url: string;
}

export interface KycConfig {
    notifyTo: string;
}

export interface ProductConfig {
    minPrice: number;
}

export interface Config {
    nest: NestConfig;
    merov: MerovConfig;
    env: EnvConfig;
    aws: AwsConfig;
    logger: LoggerConfig;
    auth0: Auth0Config;
    sendbird: SendBirdConfig;
    prove: ProveConfig;
    sardine: SardineConfig;
    middesk: MiddeskConfig;
    opensearch: OpenSearchConfig;
}
