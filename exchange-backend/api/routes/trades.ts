import { Router } from 'express';
import { Client } from 'pg';
import Decimal from 'decimal.js';

const pgClient = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'mysecretpassword',
    port: 5432,
});
pgClient.connect();

export const tradesRouter = Router();

tradesRouter.get('', async (req, res) => {
    const { symbol, limit = '50' } = req.query;

    if (!symbol) {
        return res.status(400).json({ error: 'Symbol parameter is required' });
    }

    const limitNum = Math.min(Number(limit) || 50, 100);

    try {
        const result = await pgClient.query(
            `SELECT * FROM trades 
             WHERE market = $1 
             ORDER BY timestamp DESC 
             LIMIT $2`,
            [symbol, limitNum]
        );

        res.json(result.rows.map(trade => {
            const price = new Decimal(trade.price || '0');
            const quantity = new Decimal(trade.amount || '0');
            const quoteQuantity = price.times(quantity).toString();

            return {
                id: trade.id,
                isBuyerMaker: trade.side === 'sell',
                price: price.toString(),
                quantity: quantity.toString(),
                quoteQuantity: quoteQuantity,
                timestamp: Math.floor(new Date(trade.timestamp).getTime() / 1000)
            };
        }));
    } catch (error) {
        console.error('Error fetching trades:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
