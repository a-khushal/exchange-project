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
            const resJSON: DbMessage = JSON.parse(response);
            if (resJSON.type === TRADE_ADDED) {
                console.log("adding data");
                console.log(resJSON);
                const price = resJSON.data.price;
                const timestamp = new Date(resJSON.data.timestamp);
                const query = 'INSERT INTO sol_prices (time, price, volume, currency_code) VALUES ($1, $2, $3, $4)';
                const volume = resJSON.data.quantity || 0;
                const values = [timestamp, price, volume, "USDC"];
                await DbClient.getInstance().query(query, values);
            }
        }
    }   
}

main();