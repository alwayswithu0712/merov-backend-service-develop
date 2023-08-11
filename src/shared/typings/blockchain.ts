export const Blockchain = {
    Ethereum: 'Ethereum',
    Polygon: 'Polygon',
    BSC: 'Binance Smart Chain',
};

export type Blockchain = typeof Blockchain[keyof typeof Blockchain];
