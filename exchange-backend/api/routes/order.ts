import { Router } from "express";
import { RedisManager } from "../redis/redisManager";
import { CREATE_ORDER, type ApiResponseType, type MessageType } from "../types";

export const orderRouter = Router();

orderRouter.post("/", async (req, res) => {
    const { market, side, price, quantity, userId } = req.body;

    const result: ApiResponseType = await RedisManager.getInstance().sendAndAwait({
        type: CREATE_ORDER,
        data: {
            market,
            side,
            price,
            quantity,
            userId
        }
    });

    return res.json(result.payload)
})
