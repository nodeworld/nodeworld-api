import * as util from "util";

import { logger } from "./utils/log.utils";

const promiseTimeout = util.promisify(setTimeout);

import { createConnection, getConnection } from "typeorm";

import { app } from "./app";

const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 2000;

export const blockingConnectionWait = async () => {
    while(true) {
        try {
            await createConnection();
            return;
        } catch (e) {
            logger.warn("Failed to connect to database. Retrying...");
            await promiseTimeout(3000, async () => await blockingConnectionWait);
        }
    }
}

(async () => {
    logger.info("Connecting to database...");
    await blockingConnectionWait();
    logger.info("Database connection OK");
    app.listen(PORT as number, HOST, () => {
        logger.info(`Nodeworld API is now listening on ${HOST}:${PORT}...`);
    });
})();