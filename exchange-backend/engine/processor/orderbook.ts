import type { Fill, Order } from "../types";
import Decimal from "decimal.js";

export class OrderBook {
    baseAsset: string;
    quoteAsset: string;
    lastTradeId: number;
    currentPrice: Decimal;
    bids: Order[];
    asks: Order[];

    constructor({ baseAsset, quoteAsset, lastTradeId, currentPrice }: {
        baseAsset: string,
        quoteAsset: string,
        lastTradeId?: number;
        currentPrice?: number | string;
    }) {
        this.lastTradeId = lastTradeId || 0;
        this.currentPrice = new Decimal(currentPrice || 0);
        this.baseAsset = baseAsset;
        this.quoteAsset = quoteAsset;
        this.bids = [];
        this.asks = [];
    }

    public get market() {
        return `${this.baseAsset}_${this.quoteAsset}`;
    }

    public get getSnapshot() {
        return {
            baseAsset: this.baseAsset,
            bids: this.bids,
            asks: this.asks,
            lastTradeId: this.lastTradeId,
            currentPrice: this.currentPrice.toString()
        }
    }

    public match(order: Order): { executedQty: string, fills: Fill[] } {
        if (!order.filled) order.filled = '0';

        let executedQty = new Decimal(0);
        let fills: Fill[] = [];

        if (order.side === "buy") {
            const result = this.matchBid(order);
            executedQty = result.executedQty;
            fills = result.fills;
            order.filled = new Decimal(order.filled).plus(executedQty).toString();

            if (new Decimal(order.filled).lt(order.quantity)) {
                this.bids.push(order);
            }
        } else if (order.side === "sell") {
            const result = this.matchAsk(order);
            executedQty = result.executedQty;
            fills = result.fills;
            order.filled = new Decimal(order.filled).plus(executedQty).toString();

            if (new Decimal(order.filled).lt(order.quantity)) {
                this.asks.push(order);
            }
        } else {
            throw new Error(`Unknown order side: ${order.side}`);
        }

        console.log("bid", this.bids);
        console.log("ask", this.asks);

        return {
            executedQty: executedQty.toString(),
            fills
        };
    }

    private matchBid(order: Order): { fills: Fill[], executedQty: Decimal } {
        this.asks.sort((a, b) => new Decimal(a.price).cmp(new Decimal(b.price)));
        let executedQty = new Decimal(0);
        const fills: Fill[] = [];

        for (const ask of this.asks) {
            if (ask.userId === order.userId) {
                continue;
            }

            const orderRemaining = new Decimal(order.quantity).minus(order.filled);
            if (executedQty.gte(orderRemaining)) {
                break;
            }

            if (new Decimal(ask.price).lte(order.price)) {
                const askRemaining = new Decimal(ask.quantity).minus(ask.filled || 0);
                if (askRemaining.lte(0)) {
                    continue;
                }

                const fillQty = Decimal.min(orderRemaining.minus(executedQty), askRemaining);
                executedQty = executedQty.plus(fillQty);
                ask.filled = (new Decimal(ask.filled || 0).plus(fillQty)).toString();

                fills.push({
                    price: ask.price,
                    quantity: fillQty.toString(),
                    tradeId: ++this.lastTradeId,
                    markerOrderId: ask.orderId,
                    otherUserId: ask.userId,
                });
            }
        }

        this.asks = this.asks.filter(ask => new Decimal(ask.filled).lt(ask.quantity));
        return {
            fills,
            executedQty
        };
    }

    private matchAsk(order: Order): { fills: Fill[], executedQty: Decimal } {
        this.bids.sort((a, b) => new Decimal(b.price).cmp(new Decimal(a.price)));
        let executedQty = new Decimal(0);
        const fills: Fill[] = [];

        for (const bid of this.bids) {
            if (bid.userId === order.userId) {
                continue;
            }

            const orderRemaining = new Decimal(order.quantity).minus(order.filled);
            if (executedQty.gte(orderRemaining)) {
                break;
            }

            if (new Decimal(bid.price).gte(order.price)) {
                const bidRemaining = new Decimal(bid.quantity).minus(bid.filled || 0);
                if (bidRemaining.lte(0)) {
                    continue;
                }

                const fillQty = Decimal.min(orderRemaining.minus(executedQty), bidRemaining);
                executedQty = executedQty.plus(fillQty);
                bid.filled = (new Decimal(bid.filled || 0).plus(fillQty)).toString();

                fills.push({
                    price: bid.price,
                    quantity: fillQty.toString(),
                    tradeId: ++this.lastTradeId,
                    markerOrderId: bid.orderId,
                    otherUserId: bid.userId,
                });
            }
        }

        this.bids = this.bids.filter(bid => new Decimal(bid.filled).lt(bid.quantity));

        return {
            fills,
            executedQty
        };
    }

    public getDepth() {
        const bidsMap = new Map<string, Decimal>();
        const asksMap = new Map<string, Decimal>();

        this.bids.forEach(bid => {
            if (new Decimal(bid.filled || '0').lt(bid.quantity)) {
                const price = new Decimal(bid.price).toString();
                bidsMap.set(price, (bidsMap.get(price) || new Decimal(0)).plus(new Decimal(bid.quantity).minus(bid.filled || '0')));
            }
        });

        this.asks.forEach(ask => {
            if (new Decimal(ask.filled || '0').lt(ask.quantity)) {
                const price = new Decimal(ask.price).toString();
                asksMap.set(price, (asksMap.get(price) || new Decimal(0)).plus(new Decimal(ask.quantity).minus(ask.filled || '0')));
            }
        });

        const bids = Array.from(bidsMap.entries())
            .map(([price, qty]) => [price, qty.toString()] as [string, string])
            .sort((a, b) => new Decimal(b[0]).minus(a[0]).toNumber());

        const asks = Array.from(asksMap.entries())
            .map(([price, qty]) => [price, qty.toString()] as [string, string])
            .sort((a, b) => new Decimal(a[0]).minus(b[0]).toNumber());

        return {
            bids: bids.filter(([_, qty]) => new Decimal(qty).gt(0)),
            asks: asks.filter(([_, qty]) => new Decimal(qty).gt(0))
        };
    }

    public getOpenOrders(userId: string) {
        return [...this.bids.filter(b => b.userId === userId), ...this.asks.filter(a => a.userId === userId)];
    }

    public cancelBid(order: Order) {
        const index = this.bids.findIndex(o => o.orderId === order.orderId);
        return index !== -1 ? this.bids.splice(index, 1)[0]?.price : undefined;
    }

    public cancelAsk(order: Order) {
        const index = this.asks.findIndex(o => o.orderId === order.orderId);
        return index !== -1 ? this.asks.splice(index, 1)[0]?.price : undefined;
    }
}
