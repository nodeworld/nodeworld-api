import { generate } from "generate-password";
import { createConnection, getConnection } from "typeorm";

import { Node } from "./models/node";
import { Visitor } from "./models/visitor";
import { blockingConnectionWait } from "./server";
import { logger } from "./utils/log.utils";

(async () => {
    try {
        await blockingConnectionWait();
        const db = getConnection().manager;
        if (await db.findOne(Node, { name: "main" })) {
            await db.remove(await db.findOne(Node, { name: "main" }));
        }
        if (await db.findOne(Visitor, { name: process.env.MAIN_MANAGER_NAME || "nodeworld" })) {
            await db.remove(await db.findOne(Visitor, {
                name: process.env.MAIN_MANAGER_NAME || "nodeworld",
            }));
        }
        const mainVisitor = new Visitor({ name: process.env.MAIN_MANAGER_NAME || "nodeworld" });
        await mainVisitor.setPassword(process.env.MAIN_MANAGER_PASSWORD || generate());
        const mainNode = new Node({
            name: "main",
            owner: mainVisitor,
            greeting: process.env.MAIN_NODE_GREETING || "Welcome to Nodeworld!",
        });
        await db.save([mainVisitor, mainNode]);
        logger.info("Database seeded.");
    } catch (e) {
        logger.error(e);
    } finally {
        process.exit();
    }
})();
