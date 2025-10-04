import { DbClient } from "./db-client";

async function initializeDB() {
    const db = DbClient.getInstance();

    try {
        await db.query(`
            CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;
        
            DROP MATERIALIZED VIEW IF EXISTS klines_1m CASCADE;
            DROP MATERIALIZED VIEW IF EXISTS klines_1h CASCADE;
            DROP MATERIALIZED VIEW IF EXISTS klines_1w CASCADE;
            DROP MATERIALIZED VIEW IF EXISTS market_stats CASCADE;
            DROP TABLE IF EXISTS trades CASCADE;
            DROP TABLE IF EXISTS sol_prices CASCADE;
        
            CREATE TABLE sol_prices (
                time TIMESTAMP WITH TIME ZONE NOT NULL,
                price DOUBLE PRECISION,
                volume DOUBLE PRECISION,
                currency_code VARCHAR(10)
            );
            SELECT create_hypertable('sol_prices', 'time');
        
            CREATE TABLE trades (
                id BIGSERIAL,
                market VARCHAR(20) NOT NULL,
                price DOUBLE PRECISION NOT NULL,
                amount DOUBLE PRECISION NOT NULL,
                side VARCHAR(4) NOT NULL CHECK (side IN ('buy', 'sell')),
                timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                order_id VARCHAR(50)
            );
        
            SELECT create_hypertable('trades', 'timestamp');
        
            CREATE INDEX idx_trades_market_timestamp ON trades(market, timestamp DESC);
            CREATE INDEX idx_trades_order_id ON trades(order_id);
        `);

        await db.query(`
            DROP MATERIALIZED VIEW IF EXISTS klines_1m CASCADE;
            CREATE MATERIALIZED VIEW klines_1m AS
            SELECT
                time_bucket('1 minute', time) AS bucket,
                (array_agg(price ORDER BY time ASC))[1] AS open,
                max(price) AS high,
                min(price) AS low,
                (array_agg(price ORDER BY time DESC))[1] AS close,
                sum(volume) AS volume,
                currency_code
            FROM sol_prices
            GROUP BY bucket, currency_code;

            DROP MATERIALIZED VIEW IF EXISTS klines_1h CASCADE;
            CREATE MATERIALIZED VIEW klines_1h AS
            SELECT
                time_bucket('1 hour', time) AS bucket,
                (array_agg(price ORDER BY time ASC))[1] AS open,
                max(price) AS high,
                min(price) AS low,
                (array_agg(price ORDER BY time DESC))[1] AS close,
                sum(volume) AS volume,
                currency_code
            FROM sol_prices
            GROUP BY bucket, currency_code;

            DROP MATERIALIZED VIEW IF EXISTS klines_1w CASCADE;
            CREATE MATERIALIZED VIEW klines_1w AS
            SELECT
                time_bucket('1 week', time) AS bucket,
                (array_agg(price ORDER BY time ASC))[1] AS open,
                max(price) AS high,
                min(price) AS low,
                (array_agg(price ORDER BY time DESC))[1] AS close,
                sum(volume) AS volume,
                currency_code
            FROM sol_prices
            GROUP BY bucket, currency_code;

            DROP MATERIALIZED VIEW IF EXISTS market_stats CASCADE;
            CREATE MATERIALIZED VIEW market_stats AS
            WITH last_24h AS (
                SELECT 
                    currency_code AS symbol,
                    (array_agg(price ORDER BY time ASC))[1] AS open_price,
                    max(price) AS high,
                    (array_agg(price ORDER BY time DESC))[1] AS last_price,
                    min(price) AS low,
                    (array_agg(price ORDER BY time DESC))[1] - (array_agg(price ORDER BY time ASC))[1] AS price_change,
                    CASE 
                        WHEN (array_agg(price ORDER BY time ASC))[1] = 0 THEN 0
                        ELSE (((array_agg(price ORDER BY time DESC))[1] - (array_agg(price ORDER BY time ASC))[1]) / 
                             NULLIF((array_agg(price ORDER BY time ASC))[1], 0)) * 100
                    END AS price_change_percent,
                    sum(volume * price) AS quote_volume,
                    sum(volume) AS volume,
                    count(*) AS trades
                FROM sol_prices
                WHERE time > NOW() - INTERVAL '24 hours'
                GROUP BY currency_code
            )
            SELECT *
            FROM last_24h;

            CREATE UNIQUE INDEX IF NOT EXISTS market_stats_symbol_idx ON market_stats(symbol);
        `);

        console.log("Database initialized successfully");
    } catch (error) {
        console.error("Error initializing database:", error);
        throw error;
    } finally {
        await db.end();
    }
}

initializeDB().catch(console.error);