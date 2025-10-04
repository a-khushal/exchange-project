import express from "express"
import cors from "cors"
import { orderRouter } from "./routes/order";
import { depthRouter } from "./routes/depth";
import { tradesRouter } from "./routes/trades";
import { tickerRouter } from "./routes/ticker";
import { klineRouter } from "./routes/kline";
import { balanceRouter } from "./routes/balance";

const app = express();
const PORT = 3002;

app.use(express.json());
app.use(cors())

app.use('/api/v1/order', orderRouter);
app.use('/api/v1/depth', depthRouter);
// app.use('/api/v1/trades', tradesRouter);
app.use('/api/v1/tickers', tickerRouter);
app.use('/api/v1/klines', klineRouter);
app.use('/api/v1/balance', balanceRouter);

app.listen(PORT, () => {
    console.log(`api server running at PORT: ${PORT}`);
});

