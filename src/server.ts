import { createConnection } from "typeorm";

import { app } from "./app";

const PORT = process.env.PORT || 2000;

(async () => {
    await createConnection();
    console.log("Database connection OK");
    app.listen(PORT, () => {
        console.log(`Nodeworld API is now listening on localhost:${PORT}...`);
    });
})();