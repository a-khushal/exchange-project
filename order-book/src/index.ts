import express from "express";
import cuid from "cuid";
import redis from "redis";
import { OrderInputSchema } from "./types";
import { orderbook, bookWithQuantity } from "./orderbook";

const BASE_ASSET = 'BTC';
const QUOTE_ASSET = 'USDT'

let tradeId = 0;

const app = express();
app.use(express.json());

interface Fill {
    "price": number,
    "qty": number,
    "tradeId": number,
}

const client = redis.createClient({ url: process.env.REDIS_URL });
await client.connect();

function fillOrder (
    orderId: string,
    price: number,
    quantity: number,
    side: 'buy' | 'sell',
    kind?: 'ioc'
): { status: "rejected" | "accepted"; executedQty: number; fills: Fill[] } {
    const fills: Fill[] = [];
    const maxFillQuantity = getFillAmount(price, quantity, side);
    let executedQty = 0;

    if (kind === 'ioc' && maxFillQuantity < quantity) {
        return { status: "rejected", executedQty: 0, fills: [] };
    }

    if (side == 'buy') {
        orderbook.asks.forEach(o => {
            if (o.price <= price && quantity > 0) { 
                const filledQty = Math.min(quantity, o.quantity);
                o.quantity -= filledQty;
                bookWithQuantity.asks[o.price] = (bookWithQuantity.asks[o.price] || 0) - (filledQty);
                fills.push({
                    price: o.price,
                    qty: filledQty,
                    tradeId: tradeId ++
                })
                executedQty += filledQty;
                quantity -= filledQty;
                if (o.quantity == 0) {
                    orderbook.asks.splice(orderbook.asks.indexOf(o), 1);
                }
                if (bookWithQuantity.asks[price] === 0) {
                    delete bookWithQuantity.asks[price];
                }
            }
        })

        if (quantity !== 0) {
            orderbook.bids.push({
                price,
                quantity: quantity - executedQty,
                side: 'bid',
                orderId
            });
            bookWithQuantity.bids[price] = (bookWithQuantity.bids[price] || 0) + (quantity - executedQty);
        }
    } else {
        orderbook.bids.forEach(o => {
            if (o.price >= price && quantity > 0) {
                const filledQty = Math.min(quantity, o.quantity);
                o.quantity -= filledQty;
                bookWithQuantity.bids[o.price] = (bookWithQuantity.bids[o.price] || 0) - (filledQty);
                fills.push({
                    price: o.price,
                    qty: filledQty,
                    tradeId: tradeId ++
                })
                executedQty += filledQty;
                quantity -= filledQty;
                if (o.quantity == 0) {
                    orderbook.bids.splice(orderbook.bids.indexOf(o), 1);
                }
                if (bookWithQuantity.bids[price] === 0) {
                    delete bookWithQuantity.bids[price];
                }
            }
        })

        if (quantity !== 0) {
            orderbook.asks.push({
                price,
                quantity: quantity - executedQty,
                side: 'ask',
                orderId
            });
            bookWithQuantity.asks[price] = (bookWithQuantity.asks[price] || 0) + (quantity - executedQty);
        }
    }

    console.log(orderbook);
    console.log(bookWithQuantity);

    return {
        status: 'accepted',
        executedQty,
        fills
    }
}

function getFillAmount(price: number, quantity: number, side: 'buy' | 'sell') {
    let filled = 0;
    if (side === 'buy') {
        orderbook.asks.forEach(o => {
            if (o.price <= price && quantity > 0) {
                const matchQty = Math.min(quantity, o.quantity);
                filled += matchQty;
                quantity -= matchQty;
            }
        });
    } else {
        orderbook.bids.forEach(o => {
            if (o.price >= price && quantity > 0) {
                const matchQty = Math.min(quantity, o.quantity);
                filled += matchQty;
                quantity -= matchQty;
            }
        });
    }
    return filled;
}

app.post('/api/v1/order', async (req, res) => {
    const order = OrderInputSchema.safeParse(req.body);

    if (!order.success) {
        res.status(400).json({ error: order.error.message });
        return;
    }

    const { baseAsset, quoteAsset, price, quantity, side, kind } = order.data;
    if (baseAsset !== BASE_ASSET || quoteAsset !== QUOTE_ASSET) {
        res.status(400).json({ error: 'Invalid asset' });
        return;
    }

    const orderId = cuid();
    const { executedQty, fills } = await fillOrder(orderId, price, quantity, side, kind);
    
    res.json({
        id: orderId,
        executedQty,
        fills,
    })
})

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});