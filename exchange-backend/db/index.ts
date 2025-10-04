import { createClient } from 'redis';
import { ORDER_UPDATE, TRADE_ADDED, type DbMessage } from './types';
import { DbClient } from './db-client';

async function main() {
    const redisClient = createClient();
    await redisClient.connect();
    console.log("connected to redis");

    while (true) {
        const response = await redisClient.rPop("db_processor" as string)
        if (!response) {

        } else {
            const data: DbMessage = JSON.parse(response);
            if (data.type === TRADE_ADDED) {
                const { market: currency_code, price, quantity, timestamp } = data.data;
                const time = new Date(timestamp);

                const query = `
                    INSERT INTO sol_prices (time, price, volume, currency_code)
                    VALUES ($1, $2, $3, $4)
                `;
                const values = [
                    time,
                    parseFloat(price),
                    parseFloat(quantity),
                    currency_code
                ];

                await DbClient.getInstance().query(query, values);
                console.log("Trade inserted successfully");
            } else if (data.type === ORDER_UPDATE) {
                const {
                    orderId,
                    executedQty,
                    market,
                    price,
                    side
                } = data.data;

                if (!market || !price || !side || !executedQty || Number(executedQty) <= 0) {
                    continue;
                }

                const tradePrice = Number(price);
                const tradeAmount = Number(executedQty);
                const tradeTimestamp = new Date();
                const tradeSide = side;

                const query = `
                    INSERT INTO trades (market, price, amount, side, timestamp, order_id)
                    VALUES ($1, $2, $3, $4, $5, $6)
                `;

                const values = [
                    market,
                    tradePrice,
                    tradeAmount,
                    tradeSide,
                    tradeTimestamp,
                    orderId
                ];

                try {
                    await DbClient.getInstance().query(query, values);
                    console.log(`Trade inserted - Market: ${market}, Price: ${tradePrice}, Amount: ${tradeAmount}, Side: ${tradeSide}`);
                } catch (err) {
                    console.error(err);
                }
            }
        }
    }

}

main();