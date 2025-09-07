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

    public match(order: Order): {
        executedQty: number,
        fills: Fill[]
    } {
        if (order.side === "buy") {
            const { fills, executedQty } = this.matchBid(order);
            order.filled = executedQty;

            if (executedQty < order.quantity) {
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
            order.filled = executedQty;

            if (executedQty < order.quantity) {
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
        this.asks.sort((a, b) => a.price - b.price);
        let executedQty = 0;
        const fills: Fill[] = [];

        for (const ask of this.asks) {
            if (ask.userId === order.userId) {
                continue;
            }

            if (executedQty >= order.quantity) {
                break;
            }

            if (ask.price <= order.price) {
                const remainingOrderQty = order.quantity - executedQty;
                const remainingAskQty = ask.quantity - ask.filled;
                if (remainingAskQty <= 0) {
                    continue;
                }

                const filledQty = Math.min(remainingOrderQty, remainingAskQty);
                executedQty += filledQty;
                ask.filled += filledQty;

                fills.push({
                    price: ask.price,
                    quantity: filledQty,
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
        this.bids.sort((a, b) => b.price - a.price);
        let executedQty = 0;
        const fills: Fill[] = [];

        for (const bid of this.bids) {
            if (bid.userId === order.userId) {
                continue;
            }

            if (executedQty >= order.quantity) {
                break;
            }

            if (bid.price >= order.price) {
                const remainingOrderQty = order.quantity - executedQty;
                const remainingBidQty = bid.quantity - bid.filled;
                if (remainingBidQty <= 0) {
                    continue;
                }

                const filledQty = Math.min(remainingOrderQty, remainingBidQty);
                executedQty += filledQty;
                bid.filled += filledQty;

                fills.push({
                    price: bid.price,
                    quantity: filledQty,
                    tradeId: ++this.lastTradeId,
                    markerOrderId: bid.orderId,
                    otherUserId: bid.userId,
                });
            }
        }

        this.bids = this.bids.filter(bid => bid.filled < bid.quantity);

        return { fills, executedQty };
    }
}
