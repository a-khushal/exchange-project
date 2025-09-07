export const CREATE_ORDER = "CREATE_ORDER"

export type ApiMessageType = {
    type: typeof CREATE_ORDER,
    data: {
        market: string,
        price: string,
        quantity: string,
        side: 'buy' | 'sell'
        userId: string,
    }
}

export interface Order {
    price: number;
    quantity: number;
    userId: string;
    orderId: string;
    filled: number;
    side: 'sell' | 'buy';
}