import { createConnection } from "typeorm";
import { generate } from "generate-password";

import { Node } from "./models/node";
import { Visitor } from "./models/visitor";

(async () => {
    try {
        const db = (await createConnection()).manager;
        if(await db.findOne(Node, { name: "main" }))
            await db.remove(await db.findOne(Node, { name: "main" }));
        if(await db.findOne(Visitor, { name: process.env.MAIN_MANAGER_NAME || "nodeworld" }))
            await db.remove(await db.findOne(Visitor, { name: process.env.MAIN_MANAGER_NAME || "nodeworld" }));
        const main_visitor = new Visitor({ name: process.env.MAIN_MANAGER_NAME || "nodeworld" });
        await main_visitor.setPassword(process.env.MAIN_MANAGER_PASSWORD || generate());
        const main_node = new Node({ name: "main", owner: main_visitor, greeting: process.env.MAIN_NODE_GREETING || "Welcome to Nodeworld!"});
        await db.save([main_visitor, main_node]);
        console.log("Database seeded.");
    } catch(e) {
        console.error(e);
    } finally {
        process.exit();
    }
})();
