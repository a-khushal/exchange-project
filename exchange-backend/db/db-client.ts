import { Client } from "pg";

export class DbClient {
    private static instance: DbClient;
    private client: Client;

    private constructor() { 
        this.client = new Client({
            user: 'postgres',
            host: 'localhost',
            database: 'postgres',
            password: 'mysecretpassword',
            port: 5432,
        });
        this.client.connect();   
    }

    public static getInstance(): DbClient {
        if (!DbClient.instance) {
            DbClient.instance = new DbClient();
        }
        return DbClient.instance;
    }

    public async query(query: string, values?: any[]) {
        return await this.client.query(query, values);
    }

    public async end() {
        await this.client.end();
    }
}
