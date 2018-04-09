import * as util from "util";

const promiseTimeout = util.promisify(setTimeout);

import { createConnection, getConnection } from "typeorm";

import { app } from "./app";

const PORT = process.env.PORT || 2000;

const blockingConnectionWait = async () => {
    while(true) {
        try {
            await createConnection();
            return;
        } catch(e) {
            console.log("Failed to connect to database. Retrying...");
            await promiseTimeout(3000, async () => await blockingConnectionWait);
        }
    }
}

(async () => {
    console.log("Connecting to database...");
    await blockingConnectionWait();
    console.log("Database connection OK");
    app.listen(PORT, () => {
        console.log(`Nodeworld API is now listening on localhost:${PORT}...`);
    });
})();