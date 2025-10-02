import type { Fill, Order } from "../types";

export class OrderBook {
    baseAsset: string;
    quoteAsset: string;
    lastTradeId: number;
    currentPrice: number;
    bids: Order[];
    asks: Order[];

    constructor({ baseAsset, quoteAsset, lastTradeId, currentPrice }: {
        baseAsset: string,
        quoteAsset: string,
        lastTradeId?: number;
        currentPrice?: number;
    }) {
        this.lastTradeId = lastTradeId || 0;
        this.currentPrice = currentPrice || 0;
        this.baseAsset = baseAsset;
        this.quoteAsset = quoteAsset;
        this.bids = [];
        this.asks = [];
    }

    public get market() {
        return [this.baseAsset, this.quoteAsset].join("/");
    }

    public get getSnapshot() {
        return {
            baseAsset: this.baseAsset,
            bids: this.bids,
            asks: this.asks,
            lastTradeId: this.lastTradeId,
            currentPrice: this.currentPrice
        }
    }

    public match(order: Order): {
        executedQty: number,
        fills: Fill[]
    } {
        if (order.side === "buy") {
            const { fills, executedQty } = this.matchBid(order);
            order.filled = executedQty.toString();

            if (Number(executedQty) < Number(order.quantity)) {
                this.bids.push(order);
            }

            console.log("asks: ", this.asks);
            console.log("bids: ", this.bids);

            return {
                executedQty,
                fills
            };
        } else if (order.side === "sell") {
            const { fills, executedQty } = this.matchAsk(order);
            order.filled = executedQty.toString();

            if (Number(executedQty) < Number(order.quantity)) {
                this.asks.push(order);
            }

            console.log("asks: ", this.asks);
            console.log("bids: ", this.bids);

            return {
                executedQty,
                fills
            };
        }

        throw new Error(`Unknown order side: ${order.side}`);
    }

    private matchBid(order: Order): {
        fills: Fill[],
        executedQty: number
    } {
        this.asks.sort((a, b) => Number(a.price) - Number(b.price));
        let executedQty = 0;
        const fills: Fill[] = [];

        for (const ask of this.asks) {
            if (ask.userId === order.userId) {
                continue;
            }

            if (Number(executedQty) >= Number(order.quantity)) {
                break;
            }

            if (Number(ask.price) <= Number(order.price)) {
                const remainingOrderQty = Number(order.quantity) - Number(executedQty);
                const remainingAskQty = Number(ask.quantity) - Number(ask.filled);
                if (remainingAskQty <= 0) {
                    continue;
                }

                const filledQty = Math.min(remainingOrderQty, remainingAskQty);
                executedQty += filledQty;
                ask.filled += filledQty;

                fills.push({
                    price: ask.price,
                    quantity: filledQty.toString(),
                    tradeId: ++this.lastTradeId,
                    markerOrderId: ask.orderId,
                    otherUserId: ask.userId,
                });
            }
        }

        this.asks = this.asks.filter(ask => ask.filled < ask.quantity);

        return { fills, executedQty };
    }

    private matchAsk(order: Order): {
        fills: Fill[],
        executedQty: number
    } {
        this.bids.sort((a, b) => Number(b.price) - Number(a.price));
        let executedQty = 0;
        const fills: Fill[] = [];

        for (const bid of this.bids) {
            if (bid.userId === order.userId) {
                continue;
            }

            if (Number(executedQty) >= Number(order.quantity)) {
                break;
            }

            if (Number(bid.price) >= Number(order.price)) {
                const remainingOrderQty = Number(order.quantity) - Number(executedQty);
                const remainingBidQty = Number(bid.quantity) - Number(bid.filled);
                if (remainingBidQty <= 0) {
                    continue;
                }

                const filledQty = Math.min(remainingOrderQty, remainingBidQty);
                executedQty += filledQty;
                bid.filled += filledQty;

                fills.push({
                    price: bid.price,
                    quantity: filledQty.toString(),
                    tradeId: ++this.lastTradeId,
                    markerOrderId: bid.orderId,
                    otherUserId: bid.userId,
                });
            }
        }

        this.bids = this.bids.filter(bid => bid.filled < bid.quantity);

        return { fills, executedQty };
    }

    public getDepth() {
        const bids: [string, string][] = [];
        const asks: [string, string][] = [];

        const bidsMap = new Map<string, number>();
        const asksMap = new Map<string, number>();

        this.bids.forEach(bid => {
            const priceKey = bid.price.toString();
            bidsMap.set(priceKey, (bidsMap.get(priceKey) ?? 0) + Number(bid.quantity));
        });

        this.asks.forEach(ask => {
            const priceKey = ask.price.toString();
            asksMap.set(priceKey, (asksMap.get(priceKey) ?? 0) + Number(ask.quantity));
        });

        bidsMap.forEach((qty, price) => bids.push([price, qty.toString()]));
        asksMap.forEach((qty, price) => asks.push([price, qty.toString()]));

        bids.sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]));
        asks.sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));

        return { bids, asks };
    }

    public getOpenOrders(userId: string) {
        const bids = this.bids.filter(b => b.userId === userId);
        const asks = this.asks.filter(a => a.userId === userId);

        return [...bids, ...asks];
    }

    public cancelBid(order: Order) {
        const index = this.bids.findIndex(x => x.orderId === order.orderId);

        if (index !== -1) {
            const bid = this.bids[index];
            this.bids.splice(index, 1);
            return bid?.price;
        }

        return undefined;
    }

    public cancelAsk(order: Order) {
        const index = this.asks.findIndex(x => x.orderId === order.orderId);

        if (index !== -1) {
            const ask = this.asks[index];
            this.asks.splice(index, 1);
            return ask?.price;
        }

        return undefined;
    }
}
