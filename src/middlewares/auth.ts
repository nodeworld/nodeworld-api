import { NextFunction, Request, Response } from "express";

import { PublicVisitor } from "../models/visitor";
import { readToken } from "../utils/jwt.utils";

export const isLoggedIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.signedCookies.visitor_session;
        if (!token) throw { message: "Undefined token.", status: 400 };
        req.visitor = await readToken(token) as PublicVisitor;
        next();
    } catch (e) {
        if (req.signedCookies.visitor_session) res.clearCookie("visitor_session");
        next(e);
    }
};
