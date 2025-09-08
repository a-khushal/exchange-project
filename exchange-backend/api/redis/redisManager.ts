import { createClient, type RedisClientType } from "redis";
import { v4 as uuidv4 } from 'uuid';
import type { ApiResponseType, MessageType } from "../types";

export class RedisManager {
    private client: RedisClientType;
    private subscriber: RedisClientType;
    private static instance: RedisManager;

    private constructor() {
        this.client = createClient();
        this.client.connect();
        this.subscriber = createClient();
        this.subscriber.connect();
    }

    public static getInstance(): RedisManager {
        if (!RedisManager.instance) {
            RedisManager.instance = new RedisManager();
        }

        return RedisManager.instance;
    }

    public sendAndAwait<T = ApiResponseType>(message: MessageType): Promise<T> {
        return new Promise<T>((resolve, _reject) => {
            const id = uuidv4();

            this.subscriber.subscribe(id, (msg: string) => {
                this.subscriber.unsubscribe(id);
                try {
                    resolve(JSON.parse(msg) as T);
                } catch (err) {
                    _reject(err);
                }
            });

            this.client.lPush("messages", JSON.stringify({ client: id, message }));
        });
    }
}