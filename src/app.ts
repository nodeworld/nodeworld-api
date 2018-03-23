import * as morgan from "koa-morgan";
import * as bodyparser from "koa-bodyparser";
import * as session from "koa-session";

import * as koa from "koa";

import { router as api_routes } from "./controllers";

const app = new koa();

app.keys = process.env.SECRET ? [process.env.SECRET] : ["secret"];

// Error-handling middleware
app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        ctx.status = err.statusCode || err.status || 500;
        console.log(err);
        ctx.body = {
            errors: err.message ? err.message : err
        };
        app.emit('err', err, ctx);
    }
})

// Third-party middleware
app.use(morgan("dev"));
app.use(bodyparser());
app.use(session(app));

// API Middleware
app.use(api_routes.routes());

export { app };