import * as bodyparser from "body-parser";
import * as cookieparser from "cookie-parser";
import * as cors from "cors";
import * as express from "express";
import * as helmet from "helmet";
import * as morgan from "morgan";

import { router as api_routes } from "./controllers";
import { logger } from "./utils/log.utils";

const PRODUCTION = true;

const app = express();

// Third-party middleware
app.use(helmet());
app.use(cors({ origin: process.env.WEB_ENDPOINT, credentials: true }));
app.use(cookieparser(process.env.TOKEN_SECRET));
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

if (PRODUCTION) {
    app.use(morgan("short", { stream: { write: m => logger.info(m.trim()) } }));
} else {
    app.use(morgan("dev", { stream: { write: m => logger.info(m.trim()) } }));
}

// API Middleware
app.use(api_routes);

// Error-handling middleware
app.use((
    err: {
        status: number,
        message: string,
    },
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
) => {
    logger.warn(`REQUEST ERROR - ${err.message}`);
    res.status(err.status || 500).json({
        errors: {
            message: err.message,
            status: err.status || 500,
        },
    });
});

export { app };
