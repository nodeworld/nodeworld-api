import { Visitor, PublicVisitor } from "../models/visitor";
import { Node } from "../models/node";

declare global {
    namespace Express {
        interface Request {
            visitor: PublicVisitor;
            ctxVisitor?: Visitor;
            ctxNode?: Node;
        }
    }
}