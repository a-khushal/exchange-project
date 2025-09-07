export const CREATE_ORDER = 'CREATE_ORDER';

export type MessageType = {
    type: typeof CREATE_ORDER,
    data: {
        market: string,
        price: string,
        quantity: string,
        side: 'buy' | 'sell'
        userId: string,
    }
}