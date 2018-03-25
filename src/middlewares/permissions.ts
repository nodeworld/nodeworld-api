import { Context} from "koa";

export const isNodeOwner = async (ctx: Context, next: () => Promise<any>) => { ctx.assert(ctx.session!.visitor.visitor_id === ctx.node.owner_id, 401); await next(); }