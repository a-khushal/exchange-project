import { Client } from 'pg';
import { Router } from "express";
import { RedisManager } from "../redis/redisManager";

const pgClient = new Client({
    user: 'your_user',
    host: 'localhost',
    database: 'my_database',
    password: 'your_password',
    port: 5432,
});
pgClient.connect();

export const klineRouter = Router();

klineRouter.get("/", async (req, res) => {
    const { market, interval, startTime: startTimeStr, endTime: endTimeStr } = req.query;

    const startTime = startTimeStr ? Number(startTimeStr) : 0;
    const endTime = endTimeStr ? Number(endTimeStr) : Date.now() / 1000; // Default to current time if not provided

    let query;
    switch (interval) {
        case '1m':
            query = `SELECT * FROM klines_1m WHERE bucket >= $1 AND bucket <= $2`;
            break;
        case '1h':
            query = `SELECT * FROM klines_1h WHERE  bucket >= $1 AND bucket <= $2`;
            break;
        case '1w':
            query = `SELECT * FROM klines_1w WHERE bucket >= $1 AND bucket <= $2`;
            break;
        default:
            return res.status(400).send('Invalid interval');
    }

    try {
        const result = await pgClient.query(query, [new Date(startTime * 1000), new Date(endTime * 1000)]);
        res.json(result.rows.map(x => ({
            close: x.close,
            end: x.bucket,
            high: x.high,
            low: x.low,
            open: x.open,
            quoteVolume: x.quoteVolume,
            start: x.start,
            trades: x.trades,
            volume: x.volume,
        })));
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});
