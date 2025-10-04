import axios from "axios";

const BASE_URL = "http://localhost:3002";
const MARKET = "SOL_USDC";
const USERS = ["007", "008", "009", "010", "011", "012"];
const TOTAL_BIDS = 20;
const TOTAL_ASKS = 20;

const NORMAL_SPREAD = 1.5;
const MATCH_PROBABILITY = 0.8;

interface Order {
    orderId: string;
    side: "buy" | "sell";
    price: number;
    quantity: number;
}

function shuffle<T>(array: T[]): T[] {
    return array
        .map((value) => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
}

async function main() {
    const refPrice = 100 + Math.random() * 2;

    const shuffledUsers = shuffle([...USERS]);

    for (const userId of shuffledUsers) {
        const openOrdersRes = await axios.get<Order[]>(
            `${BASE_URL}/api/v1/order/open`,
            { params: { userId, market: MARKET } }
        );
        const openOrders = openOrdersRes.data;

        const totalBids = openOrders.filter((o) => o.side === "buy").length;
        const totalAsks = openOrders.filter((o) => o.side === "sell").length;

        const cancelledBids = await cancelBids(userId, openOrders, refPrice);
        const cancelledAsks = await cancelAsks(userId, openOrders, refPrice);

        let bidsToAdd = TOTAL_BIDS - (totalBids - cancelledBids);
        let asksToAdd = TOTAL_ASKS - (totalAsks - cancelledAsks);

        while (bidsToAdd > 0 || asksToAdd > 0) {
            if (bidsToAdd > 0) {
                let bidPrice: number;
                if (Math.random() < MATCH_PROBABILITY) {
                    bidPrice = +(refPrice + Math.random() * 0.5).toFixed(2);
                } else {
                    bidPrice = +(refPrice - Math.random() * NORMAL_SPREAD).toFixed(2);
                }
                const qty = +(Math.random() * 1.5 + 0.1).toFixed(2);
                await placeOrder(userId, "buy", bidPrice, qty);
                bidsToAdd--;
            }

            if (asksToAdd > 0) {
                let askPrice: number;
                if (Math.random() < MATCH_PROBABILITY) {
                    askPrice = +(refPrice - Math.random() * 0.5).toFixed(2);
                } else {
                    askPrice = +(refPrice + Math.random() * NORMAL_SPREAD).toFixed(2);
                }
                const qty = +(Math.random() * 1.5 + 0.1).toFixed(2);
                await placeOrder(userId, "sell", askPrice, qty);
                asksToAdd--;
            }
        }
    }

    await new Promise((resolve) =>
        setTimeout(resolve, 50 + Math.random() * 50)
    );
    main();
}

async function placeOrder(
    userId: string,
    side: "buy" | "sell",
    price: number,
    quantity: number
) {
    try {
        await axios.post(`${BASE_URL}/api/v1/order`, {
            market: MARKET,
            side,
            price: price.toString(),
            quantity: quantity.toString(),
            userId,
        });
        console.log(`[${userId}] placed ${side} ${quantity}@${price}`);
    } catch (err) {
        console.error(err);
    }
}

async function cancelBids(userId: string, openOrders: Order[], refPrice: number) {
    const toCancel = openOrders.filter(
        (o) =>
            o.side === "buy" &&
            (o.price > refPrice || Math.random() < 0.2)
    );
    await Promise.all(
        toCancel.map((o) =>
            axios.delete(`${BASE_URL}/api/v1/order`, {
                data: { orderId: o.orderId, market: MARKET },
            })
        )
    );
    if (toCancel.length > 0)
        console.log(`[${userId}] cancelled ${toCancel.length} bids`);
    return toCancel.length;
}

async function cancelAsks(
    userId: string,
    openOrders: Order[],
    refPrice: number
) {
    const toCancel = openOrders.filter(
        (o) =>
            o.side === "sell" &&
            (o.price < refPrice || Math.random() < 0.2)
    );
    await Promise.all(
        toCancel.map((o) =>
            axios.delete(`${BASE_URL}/api/v1/order`, {
                data: { orderId: o.orderId, market: MARKET },
            })
        )
    );
    if (toCancel.length > 0)
        console.log(`[${userId}] cancelled ${toCancel.length} asks`);
    return toCancel.length;
}

main();
