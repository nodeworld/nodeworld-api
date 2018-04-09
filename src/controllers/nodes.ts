import * as express from "express";

import { getConnection } from "typeorm";

import { Node } from "../models/node";
import { Message } from "../models/message";
import { Visitor } from "../models/visitor";
import { Command } from "../models/command";
import { isLoggedIn } from "../middlewares/auth";
import { isNodeOwner } from "../middlewares/permissions";
import { parseCommand, runNodeCommand } from "../utils/command.utils";
import { redis } from "../utils/redis.utils";

const router = express.Router();

router.param("node_id", async (req, res, next, id) => {
    try {
        const db = getConnection().getRepository(Node);
        req.ctx_node = await db.findOneById(id);
        if(!req.ctx_node) throw { message: "Not found.", status: 404 };
        await next();
    } catch(e) { next(e); }
});

//  [GET] All nodes
router.get("/", async (req, res, next) => {
    try {
        const db = getConnection().getRepository(Node);
        const query_params = req.query.name && { name: req.query.name };
        const nodes = await db.find({ skip: req.query.skip || 0, take: req.query.limit || null, where: { ...query_params } });
        if(!nodes.length) throw { message: "Not found.", status: 404 };
        res.json({ nodes });
    } catch(e) { next(e); }
});

// [GET] Node by ID
router.get("/:node_id", async (req, res, next) => {
    res.json(req.ctx_node);
});

// [GET] Node log
router.get("/:node_id/log", async (req, res, next) => {
    try {
        const db = getConnection().getRepository(Message);
        const messages = await db.find({ where: { node_id: req.ctx_node!.id }, skip: req.query.skip || 0, take: req.query.limit || null });
        res.json({ messages });
    } catch(e) { next(e); }
});

// [GET] Node commands
router.get("/:node_id/commands", async (req, res, next) => {
    try {
        const db = getConnection().getRepository(Command);
        const commands = await db.find({ node_id: req.ctx_node!.id });
        res.json({ commands });
    } catch(e) { next(e); }
});

// [GET] Node owner
router.get("/:node_id/owner", async (req, res, next) => {
    try {
        const db = getConnection().getRepository(Visitor);
        const owner = await db.findOneById(req.ctx_node!.owner_id);
        res.json(owner);
    } catch(e) { next(e); }
});

// [POST] New message to node log
router.post("/:node_id/log", isLoggedIn, async (req, res, next) => {
    try {
        const db = getConnection().manager;
        const visitor = await db.findOneById(Visitor, req.visitor.id);    // TODO: find a way to omit this
        const message = new Message({
            author: visitor!,
            node: req.ctx_node!,
            type: parseInt(req.body.type),
            name: req.visitor.name,
            content: req.body.content
        });
        await db.save(message);
        const dto = { message: message.safe(), node: req.ctx_node!.name };
        redis.lpush("node:message", JSON.stringify(dto));
        res.json(await db.findOneById(Message, message.id));
    } catch(e) { next(e); }
});

// [POST] New command action to node
router.post("/:node_id/log/command", isLoggedIn, async (req, res, next) => {
    try {
        if(!req.body.name) throw { message: "Unspecified command.", status: 403 };
        const raw = `/${req.body.name} ${req.body.content}`;
        const command = parseCommand(raw);
        const result = await runNodeCommand({ command, node: req.ctx_node!, visitor: req.visitor });
        if(!result) throw { message: "Command not found.", status: 404 };
        res.status(202).send();
    } catch(e) { next(e); }
});

// [POST] New node command
router.post("/:node_id/commands", isLoggedIn, isNodeOwner, async (req, res, next) => {
    try {
        const db = getConnection().getRepository(Command);
        const command = new Command({
            node: req.ctx_node!,
            name: req.body.name,
        });
        res.json(await db.save(command));
    } catch(e) { next(e); }
});

export { router };