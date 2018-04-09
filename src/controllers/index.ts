import * as express from "express";

const router = express.Router();

import { router as visitors_router } from "./visitors";
import { router as nodes_router } from "./nodes";

router.use("/visitors", visitors_router);
router.use("/nodes", nodes_router);

export { router };

