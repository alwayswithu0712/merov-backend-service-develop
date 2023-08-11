export interface Transaction {
    createdAt: Date
    hash: string
    from: string
    to: string
    value: number
    timestamp: number
    confirmations: number
    block: number
    chain: string
    currency: string
    escrowId: number
    type?: string
}