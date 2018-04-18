import { v1 as uuidv1 } from "uuid";
import { stub } from "sinon";

export interface FindOptions {
    skip: number;
    take: number;
}

export const db_data = {
    visitors: [
        { id: uuidv1(), name: "mike", email: "mike@gmail.com" },
        { id: uuidv1(), name: "josh", email: "josh@gmail.com" },
        { id: uuidv1(), name: "tom", email: "tom@gmail.com" }
    ],
    nodes: [
        { id: uuidv1(), name: "main", greeting: "Welcome to Nodeworld!" }
    ]
}

const save_data = (e: any) => {
    switch(e.constructor.name) {
        case "Visitor":
            db_data.visitors.push(e.safe());
            break;
        case "Node":
            db_data.nodes.push(e.safe());
            break;
    }
}

export const repo_stub = {
    find: async (opts: FindOptions) => {
        if(opts.skip && !opts.take)
            return db_data.visitors.slice(opts.skip);
        else if(!opts.skip && opts.take)
            return db_data.visitors.slice(0, opts.take);
        else if(opts.skip && opts.take)
            return db_data.visitors.slice(opts.skip, opts.skip + opts.take);
        else
            return db_data.visitors;
    }
}

export const man_stub = {
    save: async (data: any | any[]) => {
        if(Array.isArray(data)) {
            data.forEach(save_data);
        } else {
            save_data(data);
            return data;
        }
    }
}