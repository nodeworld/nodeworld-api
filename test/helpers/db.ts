import { stub } from "sinon";
import { v1 as uuidv1 } from "uuid";

export interface FindOptions {
    skip: number;
    take: number;
}

export const dbData = {
    visitors: [
        { id: uuidv1(), name: "mike", email: "mike@gmail.com" },
        { id: uuidv1(), name: "josh", email: "josh@gmail.com" },
        { id: uuidv1(), name: "tom", email: "tom@gmail.com" },
    ],
    nodes: [
        { id: uuidv1(), name: "main", greeting: "Welcome to Nodeworld!" },
    ],
};

const saveData = (e: any) => {
    switch (e.constructor.name) {
        case "Visitor":
            dbData.visitors.push(e.safe());
            break;
        case "Node":
            dbData.nodes.push(e.safe());
            break;
    }
};

export const repoStub = {
    find: async (opts: FindOptions) => {
        if (opts.skip && !opts.take) {
            return dbData.visitors.slice(opts.skip);
        } else if (!opts.skip && opts.take) {
            return dbData.visitors.slice(0, opts.take);
        } else if (opts.skip && opts.take) {
            return dbData.visitors.slice(opts.skip, opts.skip + opts.take);
        }
        return dbData.visitors;
    },
};

export const manStub = {
    save: async (data: any | any[]) => {
        if (Array.isArray(data)) {
            data.forEach(saveData);
        } else {
            saveData(data);
            return data;
        }
    },
};
