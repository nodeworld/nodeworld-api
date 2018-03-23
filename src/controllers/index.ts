import * as Router from "koa-router";

import { router as visitors_router } from "./visitors";
import { router as nodes_router } from "./nodes";

const router = new Router({ });

router.use("/visitors", visitors_router.routes());
router.use("/nodes", nodes_router.routes());

export { router };

