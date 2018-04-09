import { Visitor, PublicVisitor } from "../models/visitor";
import { Node } from "../models/node";

declare global {
    namespace Express {
        interface Request {
            visitor: PublicVisitor;
            ctx_visitor?: Visitor;
            ctx_node?: Node;
            //session?: Session;
        }
    }
}