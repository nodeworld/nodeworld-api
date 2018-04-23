import { assert } from "chai";
import { SinonStub, stub } from "sinon";

import * as jwt_utils from "../../src/utils/jwt.utils";

import { parseCommand } from "../../src/utils/command.utils";
import { keys } from "../helpers/jwt";

describe("Utils", () => {
    describe("JWT", () => {
        describe("Signing", () => {
            it("should sign an object into a token", async () => {
                const readStub = stub(jwt_utils, "read").resolves(keys.private);
                const data = "secret data";
                const token = await jwt_utils.signToken(data);
                assert(token !== undefined, "token is undefined");
                assert(typeof token === "string", "signed token is not a string");
                assert(token !== data, "signed token is equal to unsigned data");
                readStub.restore();
            });
        });

        describe("Reading", () => {
            it("should read an object from a token", async () => {
                const readStub = stub(jwt_utils, "read").resolves(keys.public);
                const rawData = "secret data";
                const token = await jwt_utils.signToken(rawData);
                const readData = await jwt_utils.readToken(token);
                assert(readData !== undefined, "read data is undefined");
                assert(readData === rawData, "read data is not equal to raw data");
                readStub.restore();
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
