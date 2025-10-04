import { Router } from "express";
import { RedisManager } from "../redis/redisManager";
import { CANCEL_ORDER, CREATE_ORDER, GET_OPEN_ORDERS, type ApiResponseType } from "../types";

export const orderRouter = Router();

orderRouter.post("/", async (req, res) => {
    console.log('create_order')
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
    console.log('get_open_orders')
    const response: ApiResponseType = await RedisManager.getInstance().sendAndAwait({
        type: GET_OPEN_ORDERS,
        data: {
            userId: req.query.userId as string,
            market: req.query.market as string
        }
    });

    res.json(response.payload);
});

orderRouter.delete("/", async (req, res) => {
    const { orderId, market } = req.body;
    const response: ApiResponseType = await RedisManager.getInstance().sendAndAwait({
        type: CANCEL_ORDER,
        data: {
            orderId,
            market
        }
    });
    res.json(response.payload);
});