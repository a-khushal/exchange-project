import { Client } from 'pg';
import { Router } from "express";

const pgClient = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'mysecretpassword',
    port: 5432,
});
pgClient.connect();

export const klineRouter = Router();

klineRouter.get("", async (req, res) => {
    const { symbol, interval = '1h', startTime: startTimeStr, endTime: endTimeStr } = req.query;

    if (!symbol) {
        return res.status(400).json({ error: 'Symbol parameter is required' });
    }

    const startTime = startTimeStr ? Number(startTimeStr) : Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000); // Default to 30 days ago
    const endTime = endTimeStr ? Number(endTimeStr) : Math.floor(Date.now() / 1000); // Default to current time

    let tableName;
    switch (interval) {
        case '1m':
            tableName = 'klines_1m';
            break;
        case '1h':
            tableName = 'klines_1h';
            break;
        case '1d':
            tableName = 'klines_1d';
            break;
        case '1w':
            tableName = 'klines_1w';
            break;
        default:
            return res.status(400).json({ error: 'Invalid interval. Supported intervals: 1m, 1h, 1d, 1w' });
    }

    try {
        const query = `
            SELECT 
                bucket as "end",
                open,
                high,
                low,
                close,
                volume,
                quote_volume as "quoteVolume",
                trade_count as "trades",
                bucket - ((EXTRACT(EPOCH FROM bucket)::BIGINT % 3600) * INTERVAL '1 second') as "start"
            FROM ${tableName}
            WHERE market = $1 
            AND bucket >= to_timestamp($2) 
            AND bucket <= to_timestamp($3)
            ORDER BY bucket ASC
        `;

        const result = await pgClient.query(query, [symbol, startTime, endTime]);

        // Format the response to match the KLine interface
        const klines = result.rows.map(row => ({
            close: String(row.close || '0'),
            end: String(Math.floor(new Date(row.end).getTime() / 1000)),
            high: String(row.high || '0'),
            low: String(row.low || '0'),
            open: String(row.open || '0'),
            quoteVolume: String(row.quoteVolume || '0'),
            start: String(Math.floor(new Date(row.start).getTime() / 1000)),
            trades: String(row.trades || '0'),
            volume: String(row.volume || '0')
        }));

        res.json(klines);
    } catch (error) {
        console.error('Error fetching klines:', error);
        res.status(500).send(error);
    }
});
