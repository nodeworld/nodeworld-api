import { Request, Response, NextFunction } from "express";

export const isNodeOwner = (req: Request, res: Response, next: NextFunction) => {
    if(req.visitor.id === req.ctx_node!.owner_id)
        next();
    else
        next({ message: "Insufficient permissions.", status: 401 });
}