import { Context } from "koa";

export const isLoggedIn = async (ctx: Context, next: () => Promise<any>) => { ctx.assert(ctx.session!.visitor, 401); await next(); }