import type { Fill, Order } from "../types";


export class OrderBook {
    baseAsset: string;
    quoteAsset: string;
    bids: Order[];
    asks: Order[];
    lastTradeId: number;
    currentPrice: number;

    constructor({ baseAsset, quoteAsset, lastTradeId, currentPrice }: {
        baseAsset: string,
        quoteAsset: string,
        lastTradeId?: number;
        currentPrice?: number;
    }) {
        this.baseAsset = baseAsset;
        this.quoteAsset = quoteAsset;
        this.bids = [];
        this.asks = [];
        this.lastTradeId = lastTradeId || 0;
        this.currentPrice = currentPrice || 0;
    }

    public get market() {
        return [this.baseAsset, this.quoteAsset].join("_");
    }

    public match(order: Order): {
        executedQty: number,
        fills: Fill[]
    } {
        if (order.side == 'buy') {
            const { fills, executedQty } = this.matchBid(order);
            order.filled = executedQty;
            
            if (executedQty == order.quantity) {
                return {
                    executedQty, 
                    fills
                }
            }

            this.bids.push(order);
            return {
                executedQty, 
                fills
            }
        } else if (order.side == 'sell') {
            const { fills, executedQty } = this.matchAsk(order);
            order.filled = executedQty;
            
            if (executedQty == order.quantity) {
                return {
                    executedQty, 
                    fills
                }
            }

            this.bids.push(order);
            return {
                executedQty, 
                fills
            }
        }

        throw new Error(`Unknown order side: ${order.side}`);
    }

    private matchBid(order: Order): {
        fills: Fill[],
        executedQty: number
    } {
        this.asks.sort((a, b) => a.price - b.price);
        let executedQty = 0;
        let fills: Fill[] = [];
        
        for (const ask of this.asks) {
            if (executedQty == order.quantity) {
                break;
            }

            if (ask.price <= order.price && executedQty < order.quantity) {
                const filledQty = Math.min((order.quantity - executedQty), ask.quantity);
                executedQty += filledQty;
                ask.quantity += filledQty;
                fills.push({
                    price: ask.price,
                    quantity: filledQty,
                    tradeId: this.lastTradeId ++,
                    markerOrderId: ask.orderId,
                    otherUserId: ask.userId,
                })
            }
        }
        
        this.asks = this.asks.filter(ask => ask.filled !== ask.quantity);
        return {
            fills,
            executedQty
        }
    }

    private matchAsk(order: Order): {
        fills: Fill[],
        executedQty: number
    } {
        this.bids.sort((a, b) => b.price - a.price);
        let executedQty = 0;
        let fills: Fill[] = [];

        for (const bid of this.bids) {
            if (executedQty == order.quantity) {
                break;
            }

            if (bid.price >= order.price && executedQty < order.quantity) {
                const filledQty = Math.min((order.quantity - executedQty), bid.quantity);
                executedQty += filledQty;
                bid.quantity += filledQty;
                fills.push({
                    price: bid.price,
                    quantity: filledQty,
                    tradeId: this.lastTradeId ++,
                    markerOrderId: bid.orderId,
                    otherUserId: bid.userId,
                })
            }
        }

        this.bids = this.bids.filter(bid => bid.filled !== bid.quantity);
        return {
            fills,
            executedQty
        }
    }
}