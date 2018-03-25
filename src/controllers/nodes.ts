import * as Router from "koa-router";

import { Node } from "../models/node";
import { Message } from "../models/message";
import { Visitor } from "../models/visitor";
import { Command } from "../models/command";

import { isLoggedIn } from "../middlewares/auth";
import { isNodeOwner } from "../middlewares/permissions";

import { parseCommand, runNodeCommand } from "../utils/command.utils";

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
    if(!nodes.length) return ctx.throw(404);
    ctx.body = { nodes };
});

// [GET] Node by ID
router.get("/:node_id", async (ctx) => {
    ctx.body = ctx.node;
});

// [GET] Node log
router.get("/:node_id/log", async (ctx) => {
    const messages = await ctx.db.find(Message, { where: { node_id: ctx.node.node_id }, skip: ctx.query.skip || 0, take: ctx.query.limit || null });
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
        name: ctx.session!.visitor.name,
        content: ctx.request.body.content
    });
    await ctx.db.save(message);
    ctx.body = await ctx.db.findOneById(Message, message.message_id);
});

// [POST] New command action to node
router.post("/:node_id/log/command", isLoggedIn, async (ctx) => {
    if(!ctx.request.body.name)
        return ctx.throw(400);
    const raw = `/${ctx.request.body.name} ${ctx.request.body.content}`;
    const command = parseCommand(raw);
    const result = await runNodeCommand({ command, node: ctx.node, visitor: ctx.session!.visitor });
    ctx.assert(result, 404);
    ctx.status = 202;
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