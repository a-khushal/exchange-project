import { Router } from "express";
import { RedisManager } from "../redis/redisManager";
import { GET_BALANCE } from "../types";

export const balanceRouter = Router();

balanceRouter.get("", async (req, res) => {
    try {
        const { userId, market } = req.query;

        if (!userId || !market) {
            return res.status(400).json({ error: 'userId and market are required' });
        }

        const response = await RedisManager.getInstance().sendAndAwait({
            type: GET_BALANCE,
            data: {
                userId: userId as string,
                market: market as string
            }
        });

        if (response && response.payload) {
            res.json(response.payload);
        } else {
            res.status(404).json({ error: 'Balance not found' });
        }
    } catch (error) {
        console.error('Error fetching balance:', error);
        res.status(500).json({ error: 'Failed to fetch balance' });
    }
});
