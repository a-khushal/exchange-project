import { createClient } from 'redis';
import { TRADE_ADDED, type DbMessage } from './types';
import { DbClient } from './db-client';

const redisClient = createClient();

async function main() {
    await redisClient.connect();
    console.log('Connected to Redis, waiting for messages...');

    while (true) {
        try {
            const response = await redisClient.rPop('db_processor');

            if (response) {
                const { type, data: trade } = JSON.parse(response) as DbMessage;
                if (type === TRADE_ADDED) {
                    const query = `
                        INSERT INTO sol_prices
                        (market, price, quantity, quote_quantity, is_buyer_maker, timestamp)
                        VALUES ($1, $2, $3, $4, $5, $6)
                    `;

                    const values = [
                        trade.market,
                        trade.price,
                        trade.quantity,
                        trade.quoteQuantity,
                        trade.isBuyerMaker || false,
                        Number(trade.timestamp)
                    ];

                    await DbClient.getInstance().query(query, values);
                }
            } else {
                await new Promise(r => setTimeout(r, 1000));
            }
        } catch (err) {
            console.error('Error processing message:', err);
        }
    }
}

main().catch(console.error);