export interface Escrow {
    id: number
    address: string
    createdAt: Date
    updatedAt: Date
    value: number
    fee: number
    chain: string
    currency: string
    payeeAddress: string
    status: string
    payerAddress?: string
    payinHash?: string
    payoutHash?: string
}