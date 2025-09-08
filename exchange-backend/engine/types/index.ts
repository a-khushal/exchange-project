export const CREATE_ORDER = 'CREATE_ORDER'
export const ORDER_PLACED = 'ORDER_PLACED'
export const ORDER_CANCELED = 'ORDER_CANCELED'

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

export interface Fill {
    price: number;
    quantity: number;
    tradeId: number;
    markerOrderId: string;
    otherUserId: string;
}

export type ApiResponseType = {
    type: typeof ORDER_PLACED,
    payload: {
        orderId: string,
        executedQty: number,
        fills: Fill[]
    };
} | {
    type: typeof ORDER_CANCELED;
    payload: {
        orderId: string,
        executedQty: number,
        remainingQty: number
    }
}
