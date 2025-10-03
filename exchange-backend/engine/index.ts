import { createClient } from "redis";
import { Engine } from "./processor/engine";

const engine = new Engine();
const client = createClient();

async function main() {
    await client.connect();
    console.log('Connected to Redis, waiting for messages...');
    
    while (true) {
        try {
            const val = await client.rPop('messages');
            
            if (val) {
                engine.processor(JSON.parse(val));
            }

            else {
                await new Promise(r => setTimeout(r, 1000));
            }
        } catch (err) {
            console.error('Error:', err);
        }
    }
}

main().catch(console.error);