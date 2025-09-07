import { createClient } from "redis";
import { Engine } from "./processor/engine";


async function main() {
    const engine = new Engine();
    const client = createClient();
    client.connect();

    while (true) {
        const val = await client.rPop('messages');
        
        if (!val) {
            return;
        }

        console.log(engine.processor(JSON.parse(val)));
    }
}

main();