import { Request, Response, NextFunction } from "express";

import { readToken } from "../utils/jwt.utils";
import { PublicVisitor } from "../models/visitor";

/*export const isLoggedIn = async (req: Request, res: Response, next: NextFunction) => {
    if(!req.session!.visitor)
        next({ message: "Not logged in.", status: 400 });
    else
        next();
}*/

export const isLoggedIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies["visitor_session"];
        if(!token) throw { message: "Undefined token.", status: 400 };
        req.visitor = await readToken(token) as PublicVisitor;
        next();
    } catch(e) {
        if(req.cookies["visitor_session"]) res.clearCookie("visitor_session");
        next(e);
    }
}