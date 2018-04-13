import { assert } from "chai";
import { stub } from "sinon";

import * as jwt_utils from "../../src/utils/jwt.utils";

import { parseCommand } from "../../src/utils/command.utils";

const keypair = require("keypair");

const keys = keypair();

describe("Utils", () => {
    describe("JWT", () => {
        describe("Signing", () => {
            it("should sign an object into a token", async () => {
                const read_stub = stub(jwt_utils, "read").resolves(keys.private);
                const data = "secret data";
                const token = await jwt_utils.signToken(data);
                assert(token !== undefined, "token is undefined");
                assert(typeof token === "string", "signed token is not a string");
                assert(token !== data, "signed token is equal to unsigned data");
                read_stub.restore();
            });
        });
    
        describe("Reading", () => {
            it("should read an object from a token", async () => {
                const read_stub = stub(jwt_utils, "read").resolves(keys.public);
                const raw_data = "secret data";
                const token = await jwt_utils.signToken(raw_data);
                const read_data = await jwt_utils.readToken(token);
                assert(read_data !== undefined, "read data is undefined");
                assert(read_data === raw_data, "read data is not equal to raw data");
                read_stub.restore();
            });
        });
    });

    describe("Commands", () => {
        describe("Parsing", () => {
            it("should parse a command correctly", () => {
                const raw = "/announce hello";
                const command = parseCommand(raw);
                assert(command.name === "announce", "command name is not announce");
                assert(Array.isArray(command.args), "command args are not an array");
                assert(command.args[0] === "hello", "first command arg is not hello");
                assert(command.raw === raw, "raw command is not /announce hello");
            });
        });
    });
});