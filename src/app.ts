import * as morgan from "morgan";
import * as bodyparser from "body-parser";
import * as cookieparser from "cookie-parser";
import * as helmet from "helmet";

import * as express from "express";
import * as cors from "cors";

import { router as api_routes } from "./controllers";

const app = express();

// Third-party middleware
app.use(helmet());
app.use(cors({ origin: process.env.WEB_ENDPOINT, credentials: true }));
app.use(morgan("dev"));
app.use(cookieparser(process.env.TOKEN_SECRET));
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

// API Middleware
app.use(api_routes);

// Error-handling middleware
app.use((err: { status: number, message: string }, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.log(err);
    res.status(err.status || 500).json({ errors: { message: err.message, status: err.status || 500 }});
});

export { app };