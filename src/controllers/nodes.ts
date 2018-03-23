import * as Router from "koa-router";

import { Node } from "../models/node";
import { Message } from "../models/message";
import { Visitor } from "../models/visitor";
import { Command } from "../models/command";

import { isLoggedIn } from "../middlewares/auth";
import { isNodeOwner } from "../middlewares/permissions";

const router = new Router();

router.param("node_id", async (id, ctx, next) => {
    ctx.node = await ctx.db.findOneById(Node, id);
    ctx.assert(ctx.node, 404);
    await next();
});

//  [GET] All nodes
router.get("/", async (ctx) => {
    const query_params = ctx.query.name && { name: ctx.query.name };
    const nodes = await ctx.db.find(Node, { skip: ctx.query.skip || 0, take: ctx.query.limit || null, where: { ...query_params } });
    ctx.body = { nodes };
});

// [GET] Node by ID
router.get("/:node_id", async (ctx) => {
    ctx.body = ctx.node;
});

// [GET] Node log
router.get("/:node_id/log", async (ctx) => {
    const messages = await ctx.db.find(Message, { skip: ctx.query.skip || 0, take: ctx.query.limit || null });
    ctx.body = { messages };
});

// [GET] Node commands
router.get("/:node_id/commands", async (ctx) => {
    const commands = await ctx.db.find(Command, { node_id: ctx.node.node_id });
    ctx.body = { commands };
});

// [GET] Node owner
router.get("/:node_id/owner", async (ctx) => {
    const owner = await ctx.db.findOne(Visitor, { visitor_id: ctx.node.owner_id });
    ctx.body = owner;
});

// [POST] New message to node log
router.post("/:node_id/log", isLoggedIn, async (ctx) => {
    const message = new Message({
        author: ctx.session!.visitor,
        node: ctx.node,
        type: parseInt(ctx.request.body.type),
        content: ctx.request.body.content
    });
    ctx.body = await ctx.db.save(message);
});

// [POST] New node command
router.post("/:node_id/commands", isLoggedIn, isNodeOwner, async (ctx) => {
    const command = new Command({
        node: ctx.node,
        name: ctx.request.body.name,
    });
    ctx.body = await ctx.db.save(command);
});

export { router };