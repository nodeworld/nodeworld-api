import * as fs from "fs";
import * as jwt from "jsonwebtoken";

import { promisify } from "util";

const PRIVATE_KEY_PATH = process.env.JWT_PRIVATE_KEY_PATH;
const PRIVATE_KEY_PASSPHRASE = process.env.JWT_PRIVATE_KEY_PASSPHRASE;
const PUBLIC_KEY_PATH = process.env.JWT_PUBLIC_KEY_PATH;

export const read = promisify(fs.readFile);

if (!PRIVATE_KEY_PATH) throw new Error("JWT private key path is undefined.");
if (!PRIVATE_KEY_PASSPHRASE) throw new Error("JWT private key passphrase is undefined.");
if (!PUBLIC_KEY_PATH) throw new Error("JWT public key passphrase is undefined.");

let PRIVATE_KEY: Buffer;
let PUBLIC_KEY: Buffer;

export const signToken = async (payload: any): Promise<any> => {
    if (!PRIVATE_KEY) PRIVATE_KEY = await read(PRIVATE_KEY_PATH);
    return jwt.sign(
        payload,
        {
            key: PRIVATE_KEY.toString(),
            passphrase: PRIVATE_KEY_PASSPHRASE,
        },
        {
            algorithm: "RS256",
        },
    );
};

export const readToken = async (token: string): Promise<any> => {
    if (!PUBLIC_KEY) PUBLIC_KEY = await read(PUBLIC_KEY_PATH);
    return jwt.verify(token, PUBLIC_KEY, { algorithms: ["RS256"] });
};
