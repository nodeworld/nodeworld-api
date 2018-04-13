import * as express from "express";

import { getConnection } from "typeorm";

import { Visitor } from "../models/visitor";
import { Node } from "../models/node";
import { isLoggedIn } from "../middlewares/auth";
import { signToken } from "../utils/jwt.utils";

const router = express.Router();

export const paramVisitorID = router.param('visitor_id', async (req, res, next, id) => {
    try {
        const db = getConnection().getRepository(Visitor);
        req.ctx_visitor = await db.findOneById(id);
        if(!req.ctx_visitor) throw { message: "Not found.", status: 404 };
        await next();
    } catch(e) { next(e); }
});

//  [GET] All Visitors
export const getVisitors = router.get("/", async (req, res, next) => {
    try {
        const db = getConnection().getRepository(Visitor);
        const visitors = await db.find();
        res.json({ visitors });
    } catch(e) { next(e); }
});

//  [GET] Logged in visitor
export const getMe = router.get("/me", isLoggedIn, async (req, res, next) => {
    res.json(req.visitor);
});

//  [GET] Logout
export const getLogout = router.get("/logout", isLoggedIn, async (req, res, next) => {
    res.clearCookie("visitor_session");
    res.status(204).send();
});

//  [GET] Visitor by ID
export const getVisitorID = router.get("/:visitor_id", async (req, res, next) => {
    res.json(req.ctx_visitor);
});

//  [POST] New Visitor
export const postVisitor = router.post("/", async (req, res, next) => {
    try {
        const db = getConnection().manager;
        const visitor = new Visitor({
            name: req.body.name,
            email: req.body.email,
        });
        const visitor_node = new Node({
            name: visitor.name,
            greeting: `Welcome to ${visitor.name}'s node!`,
            owner: visitor
        });
        await visitor.setPassword(req.body.password);
        await db.save([visitor, visitor_node]);
        res.json({ visitor: visitor.safe(), node: visitor_node.safe() });
    } catch(e) { next(e); }
});

//  [POST] Login
export const postLogin = router.post("/login", async (req, res, next) => {
    try {
        if(req.visitor) throw { message: "Already logged in.", status: 403 };
        const db = getConnection().getRepository(Visitor);
        const visitor = await db.findOne({
            select: ["id", "name", "email", "password_salt", "password_hash"],
            where: { name: req.body.name }
        });
        if(!visitor) throw { message: "Not found.", status: 404 }
        if(!(await visitor.authenticate(req.body.password))) throw { message: "Authentication failed.", status: 403 };
        const token = await signToken(visitor.safe());
        console.log(token);
        res.cookie("visitor_session", token);
        res.json(visitor.safe());
    } catch(e) { next(e); }
});

//  [PATCH] Logged in visitor
export const patchMe = router.patch("/me", isLoggedIn, async (req, res, next) => {
    try {
        if(req.body.visitor_id) throw { message: "Cannot change visitor ID", status: 403 };
        const db = getConnection().getRepository(Visitor);
        const visitor = await db.findOneById(req.visitor.id, {
            select: ["id", "name", "email", "password_salt", "password_hash"]
        });
        if(!visitor) throw { message: "Not found.", status: 404 };
        db.merge(visitor, req.body);
        await db.save(visitor);
        req.visitor = visitor.safe();
        res.json(visitor.safe());
    } catch(e) { next(e); }
});

export { router };