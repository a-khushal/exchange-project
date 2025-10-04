import { Router } from 'express';
import { Client } from 'pg';

const pgClient = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'mysecretpassword',
    port: 5432,
});
pgClient.connect();

export const tickerRouter = Router();

tickerRouter.get('', async (_req, res) => {
    try {
        const query = `
            SELECT 
                symbol as "symbol",
                open_price as "firstPrice",
                high as "high",
                last_price as "lastPrice",
                low as "low",
                price_change as "priceChange",
                price_change_percent as "priceChangePercent",
                quote_volume as "quoteVolume",
                volume as "volume",
                trades as "trades"
            FROM market_stats
        `;

        const result = await pgClient.query(query);
        const tickers = result.rows.map(ticker => ({
            firstPrice: String(ticker.firstPrice || '0'),
            high: String(ticker.high || '0'),
            lastPrice: String(ticker.lastPrice || '0'),
            low: String(ticker.low || '0'),
            priceChange: String(ticker.priceChange || '0'),
            priceChangePercent: String(ticker.priceChangePercent || '0'),
            quoteVolume: String(ticker.quoteVolume || '0'),
            symbol: String(ticker.symbol || ''),
            trades: String(ticker.trades || '0'),
            volume: String(ticker.volume || '0')
        }));

        res.json(tickers);
    } catch (error) {
        console.error('Error fetching tickers:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
