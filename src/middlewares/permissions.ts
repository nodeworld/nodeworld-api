import { NextFunction, Request, Response } from "express";

export const isNodeOwner = (req: Request, res: Response, next: NextFunction) => {
    if (req.visitor.id === req.ctxNode!.owner_id) {
        next();
    } else {
        next({ message: "Insufficient permissions.", status: 401 });
    }
};
