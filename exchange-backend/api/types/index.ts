export const CREATE_ORDER = 'CREATE_ORDER'
export const ORDER_PLACED = 'ORDER_PLACED'
export const ORDER_CANCELED = 'ORDER_CANCELED'
export const GET_OPEN_ORDERS = 'GET_OPEN_ORDERS'
export const OPEN_ORDERS = 'OPEN_ORDERS'
export const DEPTH = 'DEPTH'
export const GET_DEPTH = 'GET_DEPTH'
export const GET_BALANCE = 'GET_BALANCE'
export const CANCEL_ORDER = 'CANCEL_ORDER'

export interface Fill {
    price: number;
    quantity: number;
    tradeId: number;
    markerOrderId: string;
    otherUserId: string;
}

export interface Order {
    price: number;
    quantity: number;
    userId: string;
    orderId: string;
    filled: number;
    side: 'sell' | 'buy';
}

export type MessageType =
    | {
        type: typeof CREATE_ORDER;
        data: {
            market: string;
            price: string;
            quantity: string;
            side: "buy" | "sell";
            userId: string;
        };
    }
    | {
        type: typeof GET_OPEN_ORDERS;
        data: {
            userId: string;
            market: string;
        };
    }
    | {
        type: typeof GET_DEPTH;
        data: {
            market: string;
        };
    }
    | {
        type: typeof GET_BALANCE;
        data: {
            userId: string;
            market: string;
        };
    }
    | {
        type: typeof CANCEL_ORDER;
        data: {
            orderId: string;
            market: string;
        };
    };



export type ApiResponseType = {
    type: typeof ORDER_PLACED,
    payload: {
        orderId: string;
        executedQty: number;
        fills: Fill[]
    }
} | {
    type: typeof OPEN_ORDERS,
    payload: Order[]
} | {
    type: typeof DEPTH,
    payload: {
        bids: [string, string][],
        asks: [string, string][]
    }
} | {
    type: typeof GET_BALANCE,
    payload: {
        base: {
            available: number;
            locked: number;
        };
        quote: {
            available: number;
            locked: number;
        };
    }
} | {
    type: typeof ORDER_CANCELED,
    payload: {
        orderId: string,
        executedQty: number,
        remainingQty: number
    }
}
