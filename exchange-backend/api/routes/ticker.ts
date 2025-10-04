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

tickerRouter.get('', async (req, res) => {
    try {
        const query = `
            SELECT 
                market as "symbol",
                open_price::text as "firstPrice",
                high_24h::text as "high",
                last_price::text as "lastPrice",
                low_24h::text as "low",
                price_change_24h::text as "priceChange",
                price_change_percent_24h::text as "priceChangePercent",
                quote_volume::text as "quoteVolume",
                '0' as "trades",
                base_volume::text as "volume"
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
