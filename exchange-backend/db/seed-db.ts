import { DbClient } from "./db-client";

async function initializeDB() {
    await DbClient.getInstance().query(`
        DROP TABLE IF EXISTS "sol_prices";
        CREATE TABLE "sol_prices"(
            time            TIMESTAMP WITH TIME ZONE NOT NULL,
            price   DOUBLE PRECISION,
            volume      DOUBLE PRECISION,
            currency_code   VARCHAR (10)
        );
        
        SELECT create_hypertable('sol_prices', 'time');
    `);

    await DbClient.getInstance().query(`
        CREATE MATERIALIZED VIEW IF NOT EXISTS klines_1m AS
        SELECT
            time_bucket('1 minute', time) AS bucket,
            first(price, time) AS open,
            max(price) AS high,
            min(price) AS low,
            last(price, time) AS close,
            sum(volume) AS volume,
            currency_code
        FROM sol_prices
        GROUP BY bucket, currency_code;
    `);

    await DbClient.getInstance().query(`
        CREATE MATERIALIZED VIEW IF NOT EXISTS klines_1h AS
        SELECT
            time_bucket('1 hour', time) AS bucket,
            first(price, time) AS open,
            max(price) AS high,
            min(price) AS low,
            last(price, time) AS close,
            sum(volume) AS volume,
            currency_code
        FROM sol_prices
        GROUP BY bucket, currency_code;
    `);

    await DbClient.getInstance().query(`
        CREATE MATERIALIZED VIEW IF NOT EXISTS klines_1w AS
        SELECT
            time_bucket('1 week', time) AS bucket,
            first(price, time) AS open,
            max(price) AS high,
            min(price) AS low,
            last(price, time) AS close,
            sum(volume) AS volume,
            currency_code
        FROM sol_prices
        GROUP BY bucket, currency_code;
    `);

    await DbClient.getInstance().end();
    console.log("Database initialized successfully");
}

initializeDB().catch(console.error);