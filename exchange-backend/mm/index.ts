import axios from "axios";

const BASE_URL = "http://localhost:3000";
const MARKET = "TATA_INR";
const USERS = ["007", "008", "009", "010", "011", "012"];
const TOTAL_BIDS = 15;
const TOTAL_ASKS = 15;

interface Order {
    orderId: string;
    side: "buy" | "sell";
    price: number;
    quantity: number;
}

async function main() {
    const price = 1000 + Math.random() * 10;

    for (const userId of USERS) {
        const openOrdersRes = await axios.get<Order[]>(`${BASE_URL}/api/v1/order/open`, {
            params: { userId, market: MARKET },
        });
        const openOrders = openOrdersRes.data;

        const totalBids = openOrders.filter(o => o.side === "buy").length;
        const totalAsks = openOrders.filter(o => o.side === "sell").length;

        const cancelledBids = await cancelBidsMoreThan(userId, openOrders, price);
        const cancelledAsks = await cancelAsksLessThan(userId, openOrders, price);

        let bidsToAdd = TOTAL_BIDS - totalBids - cancelledBids;
        let asksToAdd = TOTAL_ASKS - totalAsks - cancelledAsks;

        while (bidsToAdd > 0 || asksToAdd > 0) {
            if (bidsToAdd > 0) {
                const bidPrice = +(price - Math.random()).toFixed(1);
                await placeOrder(userId, "buy", bidPrice, 1);
                bidsToAdd--;
            }

            if (asksToAdd > 0) {
                const askPrice = +(price + Math.random()).toFixed(1);
                await placeOrder(userId, "sell", askPrice, 1);
                asksToAdd--;
            }
        }
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    main();
}

async function placeOrder(userId: string, side: "buy" | "sell", price: number, quantity: number) {
    await axios.post(`${BASE_URL}/api/v1/order`, {
        market: MARKET,
        side,
        price: price.toString(),
        quantity: quantity.toString(),
        userId,
    });
}

async function cancelBidsMoreThan(userId: string, openOrders: Order[], price: number) {
    const toCancel = openOrders.filter(o => o.side === "buy" && (o.price > price || Math.random() < 0.1));
    await Promise.all(toCancel.map(o => axios.delete(`${BASE_URL}/api/v1/order`, { data: { orderId: o.orderId, market: MARKET } })));
    return toCancel.length;
}

async function cancelAsksLessThan(userId: string, openOrders: Order[], price: number) {
    const toCancel = openOrders.filter(o => o.side === "sell" && (o.price < price || Math.random() < 0.1));
    await Promise.all(toCancel.map(o => axios.delete(`${BASE_URL}/api/v1/order`, { data: { orderId: o.orderId, market: MARKET } })));
    return toCancel.length;
}

main();
