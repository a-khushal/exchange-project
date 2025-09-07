import express from "express"
import { orderRouter } from "./routes/order";

const app = express();

app.use(express.json());

app.use('/api/v1/order', orderRouter);

app.listen(3000, () => {
    console.log('api server running at PORT: 3000');
});

