import { Router } from "express";
import { RedisManager } from "../redis/redisManager";
import { CREATE_ORDER, GET_OPEN_ORDERS, type ApiResponseType } from "../types";

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

orderRouter.get("/open", async (req, res) => {
    const response: ApiResponseType = await RedisManager.getInstance().sendAndAwait({
        type: GET_OPEN_ORDERS,
        data: {
            userId: req.query.userId as string,
            market: req.query.market as string
        }
    });

    res.json(response.payload);
});