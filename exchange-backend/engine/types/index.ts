export const CREATE_ORDER = 'CREATE_ORDER'
export const ORDER_PLACED = 'ORDER_PLACED'
export const ORDER_CANCELED = 'ORDER_CANCELED'
export const GET_OPEN_ORDERS = 'GET_OPEN_ORDERS'
export const OPEN_ORDERS = 'OPEN_ORDERS'
export const DEPTH = 'DEPTH'
export const GET_DEPTH = 'GET_DEPTH'
export const ON_RAMP = 'ON_RAMP'
export const BASE_CURRENCY = 'USCD'
export const CANCEL_ORDER = 'CANCEL_ORDER'
export const TRADE_ADDED = 'TRADE_ADDED'
export const ORDER_UPDATE = 'ORDER_UPDATE'

export interface Order {
    price: string;
    quantity: string;
    userId: string;
    orderId: string;
    filled: string;
    side: 'sell' | 'buy';
}

export interface Fill {
    price: string;
    quantity: string;
    tradeId: number;
    markerOrderId: string;
    otherUserId: string;
}

export type ApiMessageType = {
    type: typeof CREATE_ORDER,
    data: {
        market: string,
        price: string,
        quantity: string,
        side: 'buy' | 'sell'
        userId: string,
    }
} | {
    type: typeof GET_OPEN_ORDERS,
    data: {
        market: string,
        userId: string,
    }
} | {
    type: typeof GET_DEPTH,
    data: {
        market: string,
    }
} | {
    type: typeof ON_RAMP,
    data: {
        userId: string,
        amount: string
    }
} | {
    type: typeof CANCEL_ORDER,
    data: {
        market: string,
        orderId: string,
    }
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
} | {
    type: typeof OPEN_ORDERS,
    payload: Order[]
} | {
    type: typeof DEPTH,
    payload: {
        bids: [string, string][],
        asks: [string, string][]
    }
}

export type TickerUpdateMessage = {
    stream: string,
    data: {
        c?: string,
        h?: string,
        l?: string,
        v?: string,
        V?: string,
        s?: string,
        id: number,
        e: "ticker"
    }
}

export type DepthUpdateMessage = {
    stream: string,
    data: {
        b?: [string, string][],
        a?: [string, string][],
        e: "depth"
    }
}

export type TradeAddedMessage = {
    stream: string,
    data: {
        t: number,
        m: boolean,
        p: string,
        q: string,
        s: string, // symbol
        e: "trade",
    }
}

export type WsMessage = TickerUpdateMessage | DepthUpdateMessage | TradeAddedMessage;


export type DbMessage = {
    type: typeof TRADE_ADDED,
    data: {
        id: string,
        isBuyerMaker: boolean,
        price: string,
        quantity: string,
        quoteQuantity: string,
        timestamp: number,
        market: string
    }
} | {
    type: typeof ORDER_UPDATE,
    data: {
        orderId: string,
        executedQty: number,
        market?: string,
        price?: string,
        quantity?: string,
        side?: "buy" | "sell",
    }
}