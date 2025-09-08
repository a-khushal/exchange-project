export const CREATE_ORDER = 'CREATE_ORDER';
export const ORDER_PLACED = 'ORDER_PLACED';

export interface Fill {
    price: number;
    quantity: number;
    tradeId: number;
    markerOrderId: string;
    otherUserId: string;
}

export interface MessageType {
    type: typeof CREATE_ORDER,
    data: {
        market: string,
        price: string,
        quantity: string,
        side: 'buy' | 'sell'
        userId: string,
    }
}

export interface ApiResponseType {
    type: typeof ORDER_PLACED;
    payload: {
        orderId: string;
        executedQty: number;
        fills: Fill[]
    };
}
