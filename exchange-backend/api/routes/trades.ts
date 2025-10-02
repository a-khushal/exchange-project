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

export const tradesRouter = Router();

// Get recent trades for a market
tradesRouter.get('/', async (req, res) => {
    const { market, limit = '100' } = req.query;

    if (!market) {
        return res.status(400).json({ error: 'Market parameter is required' });
    }

    const limitNum = Math.min(Number(limit) || 100, 1000); // Max 1000 trades

    try {
        const result = await pgClient.query(
            `SELECT * FROM trades 
             WHERE market = $1 
             ORDER BY timestamp DESC 
             LIMIT $2`,
            [market, limitNum]
        );

        res.json(result.rows.map(trade => ({
            id: trade.id,
            price: trade.price,
            amount: trade.amount,
            total: trade.price * trade.amount,
            type: trade.side, // 'buy' or 'sell'
            timestamp: trade.timestamp,
            market: trade.market
        })));
    } catch (error) {
        console.error('Error fetching trades:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// get trade history for a market
tradesRouter.get('/history', async (req, res) => {
    const { market, startTime, endTime, limit = '100' } = req.query;

    if (!market) {
        return res.status(400).json({ error: 'Market parameter is required' });
    }

    const limitNum = Math.min(Number(limit) || 100, 1000);
    const start = startTime ? new Date(Number(startTime) * 1000) : new Date(0);
    const end = endTime ? new Date(Number(endTime) * 1000) : new Date();

    try {
        const result = await pgClient.query(
            `SELECT * FROM trades 
             WHERE market = $1 
             AND timestamp >= $2 
             AND timestamp <= $3
             ORDER BY timestamp DESC 
             LIMIT $4`,
            [market, start, end, limitNum]
        );

        res.json(result.rows.map(trade => ({
            id: trade.id,
            price: trade.price,
            amount: trade.amount,
            total: trade.price * trade.amount,
            type: trade.side,
            timestamp: trade.timestamp,
            market: trade.market
        })));
    } catch (error) {
        console.error('Error fetching trade history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});