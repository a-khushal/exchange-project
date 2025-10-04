import { DbClient } from './db-client';

async function refreshViews() {
    const db = DbClient.getInstance();
    try {
        await Promise.all([
            db.query('REFRESH MATERIALIZED VIEW klines_1m'),
            db.query('REFRESH MATERIALIZED VIEW klines_1h'),
            db.query('REFRESH MATERIALIZED VIEW klines_1w'),
            db.query('REFRESH MATERIALIZED VIEW market_stats')
        ]);

        console.log(new Date().toISOString(), "All materialized views refreshed successfully");
    } catch (error) {
        console.error("Error refreshing materialized views:", error);
    }
}

refreshViews();

setInterval(() => {
    refreshViews();
}, 1000 * 10);
