import { expect } from "chai";
import { SinonStub, stub } from "sinon";

import * as jwt_utils from "../../src/utils/jwt.utils";

import { parseCommand } from "../../src/utils/command.utils";
import { keys, readToken, signToken } from "../helpers/jwt";

describe("Utils", () => {
    describe("JWT", () => {
        describe("Signing", () => {
            it("should sign an object into a token", async () => {
                const readStub = stub(jwt_utils, "read").resolves(keys.private);
                const data = "secret data";
                const token = await jwt_utils.signToken(data);
                expect(token).to.be.a("string");
                expect(token).to.not.equal(data);
                readStub.restore();
            });
        });

        describe("Reading", () => {
            it("should read an object from a token", async () => {
                const readStub = stub(jwt_utils, "read").resolves(keys.public);
                const rawData = "secret data";
                const token = await jwt_utils.signToken(rawData);
                const readData = await jwt_utils.readToken(token);
                expect(readData).to.equal(rawData);
                readStub.restore();
            });
        });
    });

    describe("Commands", () => {
        describe("Parsing", () => {
            it("should parse a command correctly", () => {
                const raw = "/announce hello";
                const command = parseCommand(raw);
                expect(command.name).to.equal("announce");
                expect(command.args).to.be.an("array").that.is.not.empty;
                expect(command.args[0]).to.equal("hello");
                expect(command.raw).to.equal(raw);
            });
        });
    });
});
