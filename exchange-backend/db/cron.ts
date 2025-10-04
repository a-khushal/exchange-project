import { Client } from 'pg'; 

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'mysecretpassword',
    port: 5432,
});
client.connect();

async function refreshViews() {
    try {
        // Refresh kline views
        await Promise.all([
            client.query('REFRESH MATERIALIZED VIEW CONCURRENTLY klines_1m'),
            client.query('REFRESH MATERIALIZED VIEW CONCURRENTLY klines_1h'),
            client.query('REFRESH MATERIALIZED VIEW CONCURRENTLY klines_1w'),
            client.query('REFRESH MATERIALIZED VIEW CONCURRENTLY market_stats')
        ]);
        
        console.log("All materialized views refreshed successfully");
    } catch (error) {
        console.error("Error refreshing materialized views:", error);
        throw error;
    }
}

refreshViews().catch(console.error);

setInterval(() => {
    refreshViews()
}, 1000 * 10 );