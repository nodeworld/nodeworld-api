import { getConnection } from "typeorm";

import { Command } from "../models/command";
import { Node } from "../models/node";
import { PublicVisitor } from "../models/visitor";

export interface CommandData {
    name: string;
    raw: string;
    args: string[];
}

export interface NodeCommandContext {
    command: CommandData;
    visitor: PublicVisitor;
    node: Node;
}

export const parseCommand = (raw: string): CommandData => {
    const args = raw.split(" ");
    return {
        raw,
        name: args[0].slice(1),
        args: args.slice(1),
    };
};

export const runNodeCommand = async (ctx: NodeCommandContext): Promise<boolean> => {
    const db = getConnection().getRepository(Command);
    const command = await db.findOne({ node_id: ctx.node.id, name: ctx.command.name });
    if (command) {
        return true;
    }
    return false;
    /* run command stuff */
};
