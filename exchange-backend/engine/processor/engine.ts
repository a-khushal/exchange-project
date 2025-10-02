import {
    CREATE_ORDER,
    ORDER_PLACED,
    ORDER_CANCELED,
    GET_OPEN_ORDERS,
    OPEN_ORDERS,
    GET_DEPTH,
    DEPTH,
    BASE_CURRENCY,
    ON_RAMP,

    type ApiMessageType,
    type Fill,
    type Order,
} from "../types";
import { OrderBook } from "./orderbook";
import { v4 as uuidv4 } from 'uuid';
import { RedisManager } from "../redis/redisManager";

interface Balance {
    available: number;
    locked: number;
}

type UserBalances = {
    [key: string]: Balance;
};

export class Engine {
    orderbooks: OrderBook[] = [];
    balances: Map<string, UserBalances> = new Map();

    public constructor() {
        this.orderbooks.push(new OrderBook({
            baseAsset: "SOL",
            quoteAsset: "USDC"
        }));
        this.setBaseBalances();
    }

    public processor({ client, message }: {
        client: string;
        message: ApiMessageType
    }) {
        switch (message.type) {
            case CREATE_ORDER:
                try {
                    const result = this.createOrder(message.data.market, message.data.price, message.data.quantity, message.data.side, message.data.userId);
                    console.log(`result: ${result}\n\n`);

                    RedisManager.getInstance().sendToApi(client, {
                        type: ORDER_PLACED,
                        payload: {
                            orderId: result.orderId,
                            executedQty: result.executedQty,
                            fills: result.fills
                        }
                    })
                } catch (e) {
                    console.log(e);
                    RedisManager.getInstance().sendToApi(client, {
                        type: ORDER_CANCELED,
                        payload: {
                            orderId: "",
                            executedQty: 0,
                            remainingQty: 0
                        }
                    });
                }
                break;
            case GET_OPEN_ORDERS:
                try {
                    const book = this.orderbooks.find(o => o.market === message.data.market);
                    if (!book) {
                        throw new Error("No order book found");
                    }

                    const openOrders = book.getOpenOrders(message.data.userId);
                    RedisManager.getInstance().sendToApi(client, {
                        type: OPEN_ORDERS,
                        payload: openOrders
                    })
                } catch (e) {
                    console.log(e);
                }
                break;
            case GET_DEPTH:
                try {
                    const market = message.data.market;
                    const orderbook = this.orderbooks.find(o => o.market === market);
                    if (!orderbook) {
                        throw new Error("No orderbook found");
                    }
                    RedisManager.getInstance().sendToApi(client, {
                        type: DEPTH,
                        payload: orderbook.getDepth()
                    });
                } catch (e) {
                    console.log(e);
                    RedisManager.getInstance().sendToApi(client, {
                        type: DEPTH,
                        payload: {
                            bids: [],
                            asks: []
                        }
                    });
                }
                break;
            case ON_RAMP:
                const userId = message.data.userId;
                const amount = Number(message.data.amount);
                this.onRamp(userId, amount);
                break;
            default:
                throw new Error('wrong message type')
        }
    }

    private createOrder(market: string, price: string, quantity: string, side: "buy" | "sell", userId: string) {
        const orderbook = this.orderbooks.find(o => o.market === market);

        if (!orderbook) {
            throw new Error("no orderbook found");
        }

        const baseAsset = market.split("/")[0]!;
        const quoteAsset = market.split("/")[1]!;

        this.checkAndLockFunds(side, price, quantity, userId, baseAsset, quoteAsset);
        const order: Order = {
            price: Number(price),
            quantity: Number(quantity),
            filled: 0,
            userId,
            orderId: uuidv4(),
            side
        }
        const { fills, executedQty } = orderbook.match(order);
        this.updateBalance(userId, quoteAsset, baseAsset, fills, side);

        return {
            executedQty,
            orderId: order.orderId,
            fills,
        }
    }

    private checkAndLockFunds(side: string, price: string, quantity: string, userId: string, baseAsset: string, quoteAsset: string) {
        const balance = this.balances.get(userId);

        if (!balance) {
            throw new Error("Insufficient funds");
        }

        const amount = Number(quantity);
        const cost = Number(price) * amount;

        if (side === "buy") {
            const assetBalance = balance[quoteAsset];

            if (!assetBalance) {
                throw new Error(`No balance for asset ${quoteAsset}`);
            }

            if (assetBalance.available < cost) {
                throw new Error("Insufficient funds");
            }

            assetBalance.available -= cost;
            assetBalance.locked += cost;
        } else if (side === 'sell') {
            const assetBalance = balance[baseAsset];
            if (!assetBalance) {
                throw new Error(`No balance for asset ${baseAsset}`);
            }

            if (assetBalance.available < amount) {
                throw new Error("Insufficient funds");
            }

            assetBalance.available -= amount;
            assetBalance.locked += amount;
        }
    }

    private updateBalance(userId: string, quoteAsset: string, baseAsset: string, fills: Fill[], side: "buy" | "sell") {
        if (side == "buy") {
            fills.forEach(fill => {
                const seller = this.balances.get(fill.otherUserId);
                const buyer = this.balances.get(userId);

                if (!seller || !buyer) {
                    return;
                }

                if (seller.quoteAsset && seller.baseAsset) {
                    seller.quoteAsset.available = (seller.quoteAsset.available ?? 0) + (fill.quantity * fill.price);
                    seller.baseAsset.locked = (seller.baseAsset.locked ?? 0) - fill.quantity;
                }

                if (buyer.quoteAsset && buyer.baseAsset) {
                    buyer.quoteAsset.locked = (buyer.quoteAsset.locked ?? 0) - (fill.quantity * fill.price);
                    buyer.baseAsset.available = (buyer.baseAsset.available ?? 0) + fill.quantity;
                }
            });
        } else if (side == 'sell') {
            fills.forEach(fill => {
                const buyer = this.balances.get(fill.otherUserId);
                const seller = this.balances.get(userId);

                if (!buyer || !seller) {
                    return;
                }

                if (buyer.quoteAsset && buyer.baseAsset) {
                    buyer.quoteAsset.locked = (buyer.quoteAsset.locked ?? 0) - (fill.quantity * fill.price);
                    buyer.baseAsset.available = (buyer.baseAsset.available ?? 0) + fill.quantity;
                }

                if (seller.quoteAsset && seller.baseAsset) {
                    seller.quoteAsset.available = (seller.quoteAsset.available ?? 0) + (fill.quantity * fill.price);
                    seller.baseAsset.locked = (seller.baseAsset.locked ?? 0) - fill.quantity;
                }
            });
        }
    }

    onRamp(userId: string, amount: number) {
        const userBalance = this.balances.get(userId) || {} as UserBalances;

        if (!userBalance[BASE_CURRENCY]) {
            userBalance[BASE_CURRENCY] = {
                available: 0,
                locked: 0
            };
        }

        userBalance[BASE_CURRENCY].available += amount;
        this.balances.set(userId, userBalance);
    }

    private setBaseBalances() {
        const BASE_CURRENCY = "SOL";
        const QUOTE_CURRENCY = "USDC";

        this.balances.set("007", {
            [BASE_CURRENCY]: { available: 2, locked: 0 },
            [QUOTE_CURRENCY]: { available: 200, locked: 0 }
        });

        this.balances.set("008", {
            [BASE_CURRENCY]: { available: 2, locked: 0 },
            [QUOTE_CURRENCY]: { available: 300, locked: 0 }
        });

        this.balances.set("009", {
            [BASE_CURRENCY]: { available: 2, locked: 0 },
            [QUOTE_CURRENCY]: { available: 100, locked: 0 }
        });

        this.balances.set("010", {
            [BASE_CURRENCY]: { available: 2, locked: 0 },
            [QUOTE_CURRENCY]: { available: 100, locked: 0 }
        });

        this.balances.set("011", {
            [BASE_CURRENCY]: { available: 2, locked: 0 },
            [QUOTE_CURRENCY]: { available: 200, locked: 0 }
        });

        this.balances.set("012", {
            [BASE_CURRENCY]: { available: 2, locked: 0 },
            [QUOTE_CURRENCY]: { available: 100, locked: 0 }
        });
    }
}    