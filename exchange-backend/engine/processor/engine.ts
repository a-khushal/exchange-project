import { CREATE_ORDER, type ApiMessageType, type Order } from "../types";
import type { OrderBook } from "./orderbook";
import { v4 as uuidv4 } from 'uuid';

interface Balance {
    [key: string]: {
        available: number;
        locked: number;
    }
}

export class Engine {
    orderbooks: OrderBook[] = [];
    balances: Map<String, Balance> = new Map();

    public processor({ client, message }: {
        client: string;
        message: ApiMessageType
    }) {
        switch (message.type) {
            case CREATE_ORDER:
                try {
                    const result = this.createOrder(message);
                } catch (err: any) {
                    console.log(err)
                }
        }
    }

    private createOrder(message: ApiMessageType) {
        const { market, quantity, price, userId, side } = message.data;
        const orderbook = this.orderbooks.find(o => o.market === market);

        if (!orderbook) {
            throw new Error("no orderbook found");
        }

        const baseAsset = market.split("_")[0]!;
        const quoteAsset = market.split("_")[1]!;

        this.checkAndLockFunds(side, price, quantity, userId, baseAsset, quoteAsset);
        const order: Order = {
            price: Number(price),
            quantity: Number(quantity),
            filled: 0,
            userId,
            orderId: uuidv4(),
            side
        }
        const { fills, exectuedQty } = orderbook.match(order);

        return {
            fills,
            exectuedQty,
            orderId: order.orderId
        }
    }

    private checkAndLockFunds(side: string, price: string, quantity: string, userId: string, baseAsset: string, quoteAsset: string) {
        if (side === "buy") {
            const balance = this.balances.get(userId);

            if (!balance) {
                throw new Error("Insufficient funds");
            }

            const cost = Number(price) * Number(quantity);

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
            const balance = this.balances.get(userId);

            if (!balance) {
                throw new Error("Insufficient funds");
            }

            const cost = Number(price) * Number(quantity);

            const assetBalance = balance[baseAsset];
            if (!assetBalance) {
                throw new Error(`No balance for asset ${baseAsset}`);
            }

            if (assetBalance.available < cost) {
                throw new Error("Insufficient funds");
            }

            assetBalance.available -= cost;
            assetBalance.locked += cost;
        }
    }
}