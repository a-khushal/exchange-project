import { Router } from 'express';
import { Client } from 'pg';

const pgClient = new Client({
    user: 'your_user',
    host: 'localhost',
    database: 'my_database',
    password: 'your_password',
    port: 5432,
});
pgClient.connect();

export const tickerRouter = Router();

// Gets ticker data for all markets or a specific market
tickerRouter.get('/', async (req, res) => {
    const { market } = req.query;

    try {
        let result;
        let queryParams = [];
        let query = `
            SELECT 
                market,
                last_price,
                base_volume,
                quote_volume,
                high_24h,
                low_24h,
                price_change_24h,
                price_change_percent_24h,
                highest_bid,
                lowest_ask
            FROM market_stats
        `;

        if (market) {
            query += ' WHERE market = $1';
            queryParams.push(market);
        }

        result = await pgClient.query(query, queryParams);

        if (market) {
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Market not found' });
            }
            return res.json(formatTickerResponse(result.rows[0]));
        }

        // If no specific market was requested, return all markets
        const response = Object.fromEntries(
            result.rows.map(row => [row.market, formatTickerResponse(row)])
        );

        res.json(response);
    } catch (error) {
        console.error('Error fetching ticker:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Gets ticker data for all markets, sorted by volume
tickerRouter.get('/all', async (req, res) => {
    try {
        const result = await pgClient.query(`
            SELECT 
                market,
                last_price,
                base_volume,
                quote_volume,
                high_24h,
                low_24h,
                price_change_24h,
                price_change_percent_24h,
                highest_bid,
                lowest_ask
            FROM market_stats
            ORDER BY quote_volume DESC
        `);

        const tickers = result.rows.reduce((acc, row) => {
            acc[row.market] = formatTickerResponse(row);
            return acc;
        }, {} as Record<string, any>);

        res.json(tickers);
    } catch (error) {
        console.error('Error fetching all tickers:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Gets detailed 24-hour statistics for a specific market
tickerRouter.get('/24hr', async (req, res) => {
    const { market } = req.query;

    if (!market) {
        return res.status(400).json({ error: 'Market parameter is required' });
    }

    try {
        const result = await pgClient.query(
            `SELECT 
                price_change_24h,
                price_change_percent_24h,
                high_24h,
                low_24h,
                base_volume,
                quote_volume
             FROM market_stats 
             WHERE market = $1`,
            [market]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Market not found' });
        }

        const stats = result.rows[0];
        res.json({
            symbol: market,
            priceChange: stats.price_change_24h,
            priceChangePercent: stats.price_change_percent_24h,
            weightedAvgPrice: 0,
            prevClosePrice: 0,
            lastPrice: 0,
            lastQty: 0,
            bidPrice: stats.highest_bid,
            bidQty: 0,
            askPrice: stats.lowest_ask,
            askQty: 0,
            openPrice: stats.high_24h - stats.price_change_24h,
            highPrice: stats.high_24h,
            lowPrice: stats.low_24h,
            volume: stats.base_volume,
            quoteVolume: stats.quote_volume,
            openTime: Date.now() - 24 * 60 * 60 * 1000,
            closeTime: Date.now(),
            firstId: 0,
            lastId: 0,
            count: 0
        });
    } catch (error) {
        console.error('Error fetching 24h ticker:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

function formatTickerResponse(row: any) {
    return {
        symbol: row.market,
        price: row.last_price,
        volume: row.base_volume,
        quoteVolume: row.quote_volume,
        high24h: row.high_24h,
        low24h: row.low_24h,
        priceChange24h: row.price_change_24h,
        priceChangePercent24h: row.price_change_percent_24h,
        highestBid: row.highest_bid,
        lowestAsk: row.lowest_ask,
        timestamp: new Date().toISOString()
    };
}