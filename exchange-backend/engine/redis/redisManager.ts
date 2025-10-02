import { createClient, type RedisClientType } from "redis";
import type { ApiResponseType, WsMessage } from "../types";

export class RedisManager {
    public static instance: RedisManager;
    private client: RedisClientType;

    private constructor() {
        this.client = createClient();
        this.client.connect();
    }

    public static getInstance(): RedisManager {
        if (!RedisManager.instance) {
            RedisManager.instance = new RedisManager();
        }

        return RedisManager.instance;
    }

    public sendToApi(client: string, message: ApiResponseType) {
        this.client.publish(client, JSON.stringify(message));
    }

    public publishMessage(channel: string, message: WsMessage) {
        this.client.publish(channel, JSON.stringify(message));
    }
}