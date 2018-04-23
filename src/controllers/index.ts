import * as express from "express";

const router = express.Router();

import { router as nodes_router } from "./nodes";
import { router as visitors_router } from "./visitors";

router.use("/visitors", visitors_router);
router.use("/nodes", nodes_router);

export { router };
