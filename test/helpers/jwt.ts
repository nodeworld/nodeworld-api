import * as jwt from "jsonwebtoken";

const keypair = require("keypair");

export const keys = keypair();

export const signToken = async (payload: any) => await jwt.sign(payload, keys.private, { algorithm: "RS256" });

export const readToken = async (token: string) => await jwt.verify(token, keys.public, { algorithms: ["RS256"] });