import * as express from "express";

import { getRepository, getManager } from "typeorm";

import { Visitor } from "../models/visitor";
import { Node } from "../models/node";
import { isLoggedIn } from "../middlewares/auth";
import { signToken } from "../utils/jwt.utils";

const router = express.Router();

export const paramVisitorID: express.RequestParamHandler = async (req, res, next, id) => {
    try {
        const db = getRepository(Visitor);
        req.ctx_visitor = await db.findOneById(id);
        if(!req.ctx_visitor) throw { message: "Not found.", status: 404 };
        await next();
    } catch(e) { next(e); }
};
router.param('visitor_id', paramVisitorID);

//  [GET] All Visitors
export const getVisitors: express.RequestHandler = async (req, res, next) => {
    try {
        const db = getRepository(Visitor);
        const query_params = req.query.name && { name: req.query.name };
        const visitors = await db.find({ skip: req.query.skip || 0, take: req.query.limit || 0, where: query_params });
        res.json({ visitors });
    } catch(e) { console.log(e); next(e); }
};
router.get("/", getVisitors);

//  [GET] Logged in visitor
export const getMe: express.RequestHandler = async (req, res, next) => {
    res.json(req.visitor);
};
router.get("/me", isLoggedIn, getMe);

//  [GET] Logout
export const getLogout: express.RequestHandler = async (req, res, next) => {
    res.clearCookie("visitor_session");
    res.status(204).send();
};
router.get("/logout", isLoggedIn, getLogout);

//  [GET] Visitor by ID
export const getVisitorID: express.RequestHandler = async (req, res, next) => {
    res.json(req.ctx_visitor);
};
router.get("/:visitor_id", getVisitorID);

//  [POST] New Visitor
export const postVisitor: express.RequestHandler = async (req, res, next) => {
    try {
        const db = getManager();
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
};
router.post("/", postVisitor);

//  [POST] Login
export const postLogin: express.RequestHandler = async (req, res, next) => {
    try {
        if(req.visitor) throw { message: "Already logged in.", status: 403 };
        const db = getRepository(Visitor);
        const visitor = await db.findOne({
            select: ["id", "name", "email", "password_salt", "password_hash"],
            where: { name: req.body.name }
        });
        if(!visitor) throw { message: "Not found.", status: 404 }
        if(!(await visitor.authenticate(req.body.password))) throw { message: "Authentication failed.", status: 403 };
        const token = await signToken(visitor.safe());
        console.log(token);
        res.cookie("visitor_session", token, { httpOnly: true, secure: true, signed: true });
        res.json(visitor.safe());
    } catch(e) { next(e); }
};
router.post("/login", postLogin);

//  [PATCH] Logged in visitor
export const patchMe: express.RequestHandler = async (req, res, next) => {
    try {
        if(req.body.visitor_id) throw { message: "Cannot change visitor ID", status: 403 };
        const db = getRepository(Visitor);
        const visitor = await db.findOneById(req.visitor.id, {
            select: ["id", "name", "email", "password_salt", "password_hash"]
        });
        if(!visitor) throw { message: "Not found.", status: 404 };
        db.merge(visitor, req.body);
        await db.save(visitor);
        req.visitor = visitor.safe();
        res.json(visitor.safe());
    } catch(e) { next(e); }
};
router.patch("/me", isLoggedIn, patchMe);

export { router };