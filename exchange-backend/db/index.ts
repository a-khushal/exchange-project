import { createClient } from 'redis';
import { TRADE_ADDED, type DbMessage } from './types';
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
                console.log("Adding trade data:", data);

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
            }
        }
    }

}

main();