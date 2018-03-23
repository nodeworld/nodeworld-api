import * as Router from "koa-router";

import { Visitor } from "../models/visitor";
import { Node } from "../models/node";

import { isLoggedIn } from "../middlewares/auth";

const router = new Router();

router.param('visitor_id', async (id, ctx, next) => {
    ctx.visitor = await ctx.db.findOne(Visitor, { visitor_id: id });
    ctx.assert(ctx.visitor, 404);
    await next();
});

//  [GET] All Visitors
router.get("/", async (ctx) => {
    const visitors = await ctx.db.find(Visitor);
    ctx.body = { visitors };
});

//  [GET] Logged in visitor
router.get("/me", isLoggedIn, async (ctx) => {
    ctx.body = ctx.session!.visitor;
});

//  [GET] Logout
router.get("/logout", isLoggedIn, async (ctx) => {
    ctx.session!.visitor = null;
    ctx.status = 204;
})

//  [GET] Visitor by ID
router.get("/:visitor_id", async (ctx) => {
    ctx.body = ctx.visitor;
});

//  [POST] New Visitor
router.post("/", async (ctx) => {
    const visitor = new Visitor({
        name: ctx.request.body.name,
        email: ctx.request.body.email,
    });
    const visitor_node = new Node({
        name: visitor.name,
        greeting: `Welcome to ${visitor.name}'s node!`,
        owner: visitor
    });
    await visitor.setPassword(ctx.request.body.password);
    await ctx.db.save([visitor, visitor_node]);
    ctx.body = { visitor: visitor.safe(), node: visitor_node.safe() };
});

//  [POST] Login
router.post("/login", async (ctx) => {
    ctx.assert(!ctx.session!.visitor, 403, "Already logged in.");
    const visitor = await ctx.db.findOne(Visitor, {
        select: ["visitor_id", "name", "email", "password_salt", "password_hash"],
        where: { name: ctx.request.body.name }
    });
    if(!visitor) return ctx.throw(404);
    if(!(await visitor.authenticate(ctx.request.body.password))) return ctx.throw(403);
    ctx.session!.visitor = visitor.safe();
    ctx.body = ctx.session!.visitor;
});

//  [PATCH] Logged in visitor
router.patch("/me", isLoggedIn, async (ctx) => {
    ctx.assert(!ctx.request.body.visitor_id, 403, "Cannot change Visitor ID.");
    const visitor = await ctx.db.findOneById(Visitor, ctx.session!.visitor.visitor_id, {
        select: ["visitor_id", "name", "email", "password_salt", "password_hash"]
    });
    if(!visitor) return ctx.throw(404);
    ctx.db.merge(Visitor, visitor, ctx.request.body);
    await ctx.db.save(visitor);
    ctx.session!.visitor = visitor.safe();
    ctx.body = visitor.safe();
});

export { router };