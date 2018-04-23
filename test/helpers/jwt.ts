import * as jwt from "jsonwebtoken";

// tslint:disable-next-line:no-var-requires
const keypair = require("keypair");

export const keys = keypair();

export const signToken = async (payload: any) => {
    return await jwt.sign(payload, keys.private, { algorithm: "RS256" });
};

export const readToken = async (token: string) => {
    return await jwt.verify(token, keys.public, { algorithms: ["RS256"] });
};
