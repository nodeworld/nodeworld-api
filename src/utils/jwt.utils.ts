import * as jwt from "jsonwebtoken";
import * as fs from "fs";

const PRIVATE_KEY_PATH = process.env.JWT_PRIVATE_KEY_PATH;
const PRIVATE_KEY_PASSPHRASE = process.env.JWT_PRIVATE_KEY_PASSPHRASE;
const PUBLIC_KEY_PATH = process.env.JWT_PUBLIC_KEY_PATH;

if(!PRIVATE_KEY_PATH) throw new Error("JWT private key path is undefined.");
if(!PRIVATE_KEY_PASSPHRASE) throw new Error("JWT private key passphrase is undefined.");
if(!PUBLIC_KEY_PATH) throw new Error("JWT public key passphrase is undefined.");

const PRIVATE_KEY = fs.readFileSync(PRIVATE_KEY_PATH);
const PUBLIC_KEY = fs.readFileSync(PUBLIC_KEY_PATH);

export const signToken = (payload: object) => jwt.sign(payload, { key: PRIVATE_KEY.toString(), passphrase: PRIVATE_KEY_PASSPHRASE }, { algorithm: "RS256" });

export const readToken = (token: string) => jwt.verify(token, PUBLIC_KEY, { algorithms: ["RS256"] });