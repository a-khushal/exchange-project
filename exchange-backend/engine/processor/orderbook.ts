import type { Order } from "../types";


export class OrderBook {
    baseAsset: string;
    quoteAsset: string;
    bids: Order[];
    asks: Order[];

    constructor({ baseAsset, quoteAsset }: {
        baseAsset: string,
        quoteAsset: string
    }) {
        this.baseAsset = baseAsset;
        this.quoteAsset = quoteAsset;
        this.bids = [];
        this.asks = [];
    }

    public get market() {
        return [this.baseAsset, this.quoteAsset].join("_");
    }

    public match(order: Order) {
        
    }
}