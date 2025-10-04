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
    CANCEL_ORDER,
    TRADE_ADDED,
    ORDER_UPDATE,
    GET_BALANCE,
    type ApiMessageType,
    type Fill,
    type Order,
} from "../types";
import { OrderBook } from "./orderbook";
import { v4 as uuidv4 } from 'uuid';
import { RedisManager } from "../redis/redisManager";
import Decimal from "decimal.js";

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

    public addOrderbook(orderbook: OrderBook) {
        this.orderbooks.push(orderbook);
    }

    public processor({ client, message }: {
        client: string;
        message: ApiMessageType
    }) {
        switch (message.type) {
            case CREATE_ORDER:
                try {
                    const result = this.createOrder(message.data.market, message.data.price, message.data.quantity, message.data.side, message.data.userId);
                    console.log(`result: ${JSON.stringify(result)}\n\n`);

                    RedisManager.getInstance().sendToApi(client, {
                        type: ORDER_PLACED,
                        payload: {
                            orderId: result.orderId,
                            executedQty: Number(result.executedQty),
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
                const amount = new Decimal(message.data.amount);
                this.onRamp(userId, amount);
                break;
            case CANCEL_ORDER:
                try {
                    const cancelMarket = message.data.market;
                    const orderId = message.data.orderId;
                    const cancelOrderbook = this.orderbooks.find(o => o.market === cancelMarket);
                    if (!cancelOrderbook) {
                        throw new Error("No orderbook found");
                    }
                    const quoteAsset = cancelMarket.split("_")[1];
                    const baseAsset = cancelMarket.split("_")[0];

                    if (!quoteAsset || !baseAsset) {
                        throw new Error("Invalid market");
                    }

                    const order = cancelOrderbook.asks.find(o => o.orderId === orderId) || cancelOrderbook.bids.find(o => o.orderId === orderId);
                    if (!order) {
                        console.log("No order found");
                        throw new Error("No order found");
                    }

                    if (order.side === "buy") {
                        const price = cancelOrderbook.cancelBid(order);
                        const leftQuantity = new Decimal(order.quantity).minus(order.filled).times(order.price);

                        const userBalances = this.balances.get(order.userId);
                        if (!userBalances) {
                            throw new Error(`No balances found for user ${order.userId}`);
                        }

                        const assetBalance = userBalances[quoteAsset];
                        if (!assetBalance) {
                            throw new Error(`No balance for asset ${quoteAsset}`);
                        }

                        assetBalance.locked = new Decimal(assetBalance.locked).minus(leftQuantity).toNumber();
                        assetBalance.available = new Decimal(assetBalance.available).plus(leftQuantity).toNumber();

                        if (price) {
                            this.sendUpdatedDepthAt(price.toString(), cancelMarket);
                        }
                    } else {
                        const price = cancelOrderbook.cancelAsk(order);
                        const leftQuantity = new Decimal(order.quantity).minus(order.filled);

                        const userBalances = this.balances.get(order.userId);
                        if (!userBalances) {
                            throw new Error(`No balances found for user ${order.userId}`);
                        }

                        const assetBalance = userBalances[baseAsset];
                        if (!assetBalance) {
                            throw new Error(`No balance for asset ${baseAsset}`);
                        }

                        assetBalance.locked = new Decimal(assetBalance.locked).minus(leftQuantity).toNumber();
                        assetBalance.available = new Decimal(assetBalance.available).plus(leftQuantity).toNumber();

                        if (price) {
                            this.sendUpdatedDepthAt(price.toString(), cancelMarket);
                        }
                    }
                } catch (e) {
                    console.log(e);
                }
                break;
            case GET_BALANCE: {
                try {
                    if (message.type !== GET_BALANCE) break;

                    const { userId, market } = message.data;
                    const [baseAsset, quoteAsset] = market.split('_');

                    if (!baseAsset || !quoteAsset) {
                        throw new Error('Invalid market format');
                    }

                    const userBalances = this.balances.get(userId);
                    if (!userBalances) {
                        throw new Error('User not found');
                    }

                    RedisManager.getInstance().sendToApi(client, {
                        type: GET_BALANCE,
                        payload: {
                            base: {
                                available: userBalances[baseAsset]?.available || 0,
                                locked: userBalances[baseAsset]?.locked || 0
                            },
                            quote: {
                                available: userBalances[quoteAsset]?.available || 0,
                                locked: userBalances[quoteAsset]?.locked || 0
                            }
                        }
                    });
                } catch (e) {
                    console.error('Error getting balance:', e);
                    RedisManager.getInstance().sendToApi(client, {
                        type: GET_BALANCE,
                        payload: {
                            base: { available: 0, locked: 0 },
                            quote: { available: 0, locked: 0 }
                        }
                    });
                }
                break;
            }
            default:
                throw new Error('wrong message type')
        }
    }

    private createOrder(market: string, price: string, quantity: string, side: "buy" | "sell", userId: string) {
        const orderbook = this.orderbooks.find(o => o.market === market);

        if (!orderbook) {
            throw new Error("no orderbook found");
        }

        const baseAsset = market.split("_")[0]!;
        const quoteAsset = market.split("_")[1]!;

        this.checkAndLockFunds(side, price, quantity, userId, baseAsset, quoteAsset);
        const order: Order = {
            price: price,
            quantity: quantity,
            filled: "0",
            userId,
            orderId: uuidv4(),
            side
        }
        const { fills, executedQty } = orderbook.match(order);
        this.updateBalance(userId, quoteAsset, baseAsset, fills, side);

        this.createDbTrades(fills, market, userId);
        this.updateDbOrders(order, Number(executedQty), fills, market);
        this.publisWsDepthUpdates(fills, price, side, market);
        this.publishWsTrades(fills, userId, market);

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

        const amount = new Decimal(quantity);
        const cost = new Decimal(price).times(amount);

        if (side === "buy") {
            const assetBalance = balance[quoteAsset];

            if (!assetBalance) {
                throw new Error(`No balance for asset ${quoteAsset}`);
            }

            if (new Decimal(assetBalance.available).lessThan(cost)) {
                throw new Error("Insufficient funds");
            }

            assetBalance.available = new Decimal(assetBalance.available).minus(cost).toNumber();
            assetBalance.locked = new Decimal(assetBalance.locked).plus(cost).toNumber();
        } else if (side === 'sell') {
            const assetBalance = balance[baseAsset];
            if (!assetBalance) {
                throw new Error(`No balance for asset ${baseAsset}`);
            }

            if (new Decimal(assetBalance.available).lessThan(amount)) {
                throw new Error("Insufficient funds");
            }

            assetBalance.available = new Decimal(assetBalance.available).minus(amount).toNumber();
            assetBalance.locked = new Decimal(assetBalance.locked).plus(amount).toNumber();
        }
    }

    sendUpdatedDepthAt(price: string, market: string) {
        const orderbook = this.orderbooks.find(o => o.market === market);

        if (!orderbook) {
            return;
        }

        const depth = orderbook.getDepth();
        const updatedBids = depth?.bids.filter(x => x[0] === price);
        const updatedAsks = depth?.asks.filter(x => x[0] === price);

        RedisManager.getInstance().publishMessage(`depth@${market}`, {
            stream: `depth@${market}`,
            data: {
                a: updatedAsks.length ? updatedAsks : [[price, "0"]],
                b: updatedBids.length ? updatedBids : [[price, "0"]],
                e: "depth"
            }
        });
    }

    createDbTrades(fills: Fill[], market: string, userId: string) {
        fills.forEach(fill => {
            RedisManager.getInstance().pushMessage({
                type: TRADE_ADDED,
                data: {
                    market: market,
                    id: fill.tradeId.toString(),
                    isBuyerMaker: fill.otherUserId === userId,
                    price: fill.price.toString(),
                    quantity: fill.quantity.toString(),
                    quoteQuantity: new Decimal(fill.quantity).times(new Decimal(fill.price)).toString(),
                    timestamp: Date.now()
                }
            });
        });
    }

    updateDbOrders(order: Order, executedQty: number, fills: Fill[], market: string) {
        RedisManager.getInstance().pushMessage({
            type: ORDER_UPDATE,
            data: {
                orderId: order.orderId,
                executedQty: executedQty,
                market: market,
                price: order.price.toString(),
                quantity: order.quantity.toString(),
                side: order.side,
            }
        });

        fills.forEach(fill => {
            RedisManager.getInstance().pushMessage({
                type: ORDER_UPDATE,
                data: {
                    orderId: fill.markerOrderId,
                    executedQty: Number(fill.quantity)
                }
            });
        });
    }

    publisWsDepthUpdates(fills: Fill[], price: string, side: "buy" | "sell", market: string) {
        const orderbook = this.orderbooks.find(o => o.market === market);
        if (!orderbook) {
            return;
        }
        const depth = orderbook.getDepth();
        if (side === "buy") {
            const updatedAsks = depth?.asks.filter(x => fills.map(f => f.price).includes(x[0]));
            const updatedBid = depth?.bids.find(x => x[0] === price);
            console.log("publish ws depth updates")
            RedisManager.getInstance().publishMessage(`depth@${market}`, {
                stream: `depth@${market}`,
                data: {
                    a: updatedAsks,
                    b: updatedBid ? [updatedBid] : [],
                    e: "depth"
                }
            });
        }
        if (side === "sell") {
            const updatedBids = depth?.bids.filter(x => fills.map(f => f.price).includes(x[0]));
            const updatedAsk = depth?.asks.find(x => x[0] === price);
            console.log("publish ws depth updates")
            RedisManager.getInstance().publishMessage(`depth@${market}`, {
                stream: `depth@${market}`,
                data: {
                    a: updatedAsk ? [updatedAsk] : [],
                    b: updatedBids,
                    e: "depth"
                }
            });
        }
    }

    publishWsTrades(fills: Fill[], userId: string, market: string) {
        fills.forEach(fill => {
            RedisManager.getInstance().publishMessage(`trade@${market}`, {
                stream: `trade@${market}`,
                data: {
                    e: "trade",
                    t: fill.tradeId,
                    m: fill.otherUserId === userId,
                    p: fill.price.toString(),
                    q: fill.quantity.toString(),
                    s: market,
                }
            });
        });
    }

    private updateBalance(userId: string, quoteAsset: string, baseAsset: string, fills: Fill[], side: "buy" | "sell") {
        if (side == "buy") {
            fills.forEach(fill => {
                const seller = this.balances.get(fill.otherUserId);
                const buyer = this.balances.get(userId);

                if (!seller || !buyer) {
                    return;
                }

                if (seller[quoteAsset] && seller[baseAsset]) {
                    seller[quoteAsset].available = new Decimal(seller[quoteAsset].available).plus(new Decimal(fill.quantity).times(fill.price)).toNumber();
                    seller[baseAsset].locked = new Decimal(seller[baseAsset].locked).minus(fill.quantity).toNumber();
                }

                if (buyer[quoteAsset] && buyer[baseAsset]) {
                    buyer[quoteAsset].locked = new Decimal(buyer[quoteAsset].locked).minus(new Decimal(fill.quantity).times(fill.price)).toNumber();
                    buyer[baseAsset].available = new Decimal(buyer[baseAsset].available).plus(fill.quantity).toNumber();
                }
            });
        } else if (side == 'sell') {
            fills.forEach(fill => {
                const buyer = this.balances.get(fill.otherUserId);
                const seller = this.balances.get(userId);

                if (!buyer || !seller) {
                    return;
                }

                if (buyer[quoteAsset] && buyer[baseAsset]) {
                    buyer[quoteAsset].locked = new Decimal(buyer[quoteAsset].locked).minus(new Decimal(fill.quantity).times(fill.price)).toNumber();
                    buyer[baseAsset].available = new Decimal(buyer[baseAsset].available).plus(fill.quantity).toNumber();
                }

                if (seller[quoteAsset] && seller[baseAsset]) {
                    seller[quoteAsset].available = new Decimal(seller[quoteAsset].available).plus(new Decimal(fill.quantity).times(fill.price)).toNumber();
                    seller[baseAsset].locked = new Decimal(seller[baseAsset].locked).minus(fill.quantity).toNumber();
                }
            });
        }
    }

    public onRamp(userId: string, amount: Decimal) {
        const userBalance = this.balances.get(userId) || {} as UserBalances;

        if (!userBalance[BASE_CURRENCY]) {
            userBalance[BASE_CURRENCY] = {
                available: 0,
                locked: 0
            };
        }

        userBalance[BASE_CURRENCY].available = new Decimal(userBalance[BASE_CURRENCY].available).plus(amount).toNumber();
        this.balances.set(userId, userBalance);
    }

    private setBaseBalances() {
        const BASE_CURRENCY = "SOL";
        const QUOTE_CURRENCY = "USDC";

        this.balances.set("007", {
            [BASE_CURRENCY]: { available: 50, locked: 0 },
            [QUOTE_CURRENCY]: { available: 5000, locked: 0 }
        });

        this.balances.set("008", {
            [BASE_CURRENCY]: { available: 50, locked: 0 },
            [QUOTE_CURRENCY]: { available: 5000, locked: 0 }
        });

        this.balances.set("009", {
            [BASE_CURRENCY]: { available: 50, locked: 0 },
            [QUOTE_CURRENCY]: { available: 5000, locked: 0 }
        });

        this.balances.set("010", {
            [BASE_CURRENCY]: { available: 50, locked: 0 },
            [QUOTE_CURRENCY]: { available: 5000, locked: 0 }
        });

        this.balances.set("011", {
            [BASE_CURRENCY]: { available: 50, locked: 0 },
            [QUOTE_CURRENCY]: { available: 5000, locked: 0 }
        });

        this.balances.set("012", {
            [BASE_CURRENCY]: { available: 50, locked: 0 },
            [QUOTE_CURRENCY]: { available: 5000, locked: 0 }
        });
    }
}
