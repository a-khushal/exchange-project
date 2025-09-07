import { createClient, type RedisClientType } from "redis";
import { v4 as uuidv4 } from 'uuid';
import type { MessageType } from "../types";

export class RedisManager {
    private client: RedisClientType;
    private publisher: RedisClientType;
    private static instance: RedisManager;

    private constructor() {
        this.client = createClient();
        this.client.connect();
        this.publisher = createClient();
        this.publisher.connect();
    }

    public static getInstance(): RedisManager {
        if (!RedisManager.instance) {
            RedisManager.instance = new RedisManager();
        }

        return RedisManager.instance;
    }

    public sendAndAwait(message: MessageType) {
        return new Promise((resolve, _reject) => {
            const id = uuidv4();

            this.publisher.subscribe(id, (message) => {
                this.publisher.unsubscribe(id);
                resolve(JSON.parse(message));
            })

            this.client.lPush("messages", JSON.stringify({ client: id, message }));
        })
    }
}