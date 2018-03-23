import { createConnection } from "typeorm";

import { app } from "./app";

const PORT = process.env.PORT || 2000;

(async () => {
    app.context.db = (await createConnection()).manager;
    console.log("Database connection OK");
    app.listen(PORT, () => {
        console.log(`Nodeworld API is now listening on localhost:${PORT}...`);
    });
})();