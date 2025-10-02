import { createClient, type RedisClientType } from "redis";
import type { ApiResponseType } from "../types";

export class RedisManager {
    public static instance: RedisManager;
    private publisher: RedisClientType;

    private constructor() {
        this.publisher = createClient();
        this.publisher.connect();
    }

    public static getInstance(): RedisManager {
        if (!RedisManager.instance) {
            RedisManager.instance = new RedisManager();
        }

        return RedisManager.instance;
    }

    public sendToApi(client: string, message: ApiResponseType) {
        this.publisher.publish(client, JSON.stringify(message));
    }

    // public publishMessage(channel: string, message: WsMessage) {
    //     this.client.publish(channel, JSON.stringify(message));
    // }
}