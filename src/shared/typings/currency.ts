export const Currency = {
    ETH: 'ETH',
    MATIC: 'MATIC',
    USDT: 'USDT',
    USDC: 'USDC',
    BTC: 'BTC',
    BNB: 'BNB'
};

export type Currency = typeof Currency[keyof typeof Currency];
