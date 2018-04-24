import { expect } from "chai";
import chai = require("chai");
import chaiAsPromised = require("chai-as-promised");
import sinonChai = require("sinon-chai");

import { Message, MessageType } from "../../src/models/message";
import { Node } from "../../src/models/node";
import { Visitor } from "../../src/models/visitor";

chai.use(sinonChai);
chai.use(chaiAsPromised);

describe("Models", () => {
    describe("Visitor", () => {
        it("should create and return a visitor", () => {
            const visitor = new Visitor({ name: "test" });
            expect(visitor).to.have.all.keys(["id", "name", "email"]);
        });

        it("should generate an id", () => {
            const visitor = new Visitor({ name: "test" });
            expect(visitor).to.have.property("id").that.is.not.empty;
        });

        it("should generate a password", async () => {
            const visitor = new Visitor({ name: "test" });
            await visitor.setPassword("test");
            expect(visitor).to.have.property("password_hash").that.is.not.empty;
            expect(visitor).to.have.property("password_salt").that.is.not.empty;
        });

        it("should successfully authenticate", async () => {
            const visitor = new Visitor({ name: "test" });
            await visitor.setPassword("test");
            await visitor.authenticate("test");
            expect(visitor.authenticate("test")).to.eventually.be.fulfilled;
        });

        it("should return a safe copy", async () => {
            const visitor = new Visitor({ name: "test" });
            await visitor.setPassword("test");
            const safe = visitor.safe();
            expect(safe).to.have.all.keys(["id", "name", "email"]);
        });
    });

    describe("Node", () => {
        it("should create and return a node", () => {
            const owner = new Visitor({ name: "test" });
            const node = new Node({ owner, name: "testworld" });
            expect(node).to.have.all.keys(["id", "owner", "name", "greeting"]);
        });

        it("should generate an id", () => {
            const owner = new Visitor({ name: "test" });
            const node = new Node({ owner, name: "testworld" });
            expect(node).to.have.property("id").that.is.not.empty;
        });

        it("should return a safe copy", async () => {
            const owner = new Visitor({ name: "test" });
            const node = new Node({ owner, name: "testworld" });
            const safe = node.safe();
            expect(safe).to.have.all.keys(["id", "owner_id", "name", "greeting"]);
        });
    });

    describe("Message", () => {
        it("should create and return a message", () => {
            const author = new Visitor({ name: "test" });
            const node = new Node({ name: "testworld", owner: author });
            const message = new Message({
                author,
                node,
                type: MessageType.CHAT,
                name: author.name,
                content: "hello world!",
            });
            expect(message).to.have.all.keys(["id", "author", "node", "type", "name", "content"]);
        });

        it("should generate an id", () => {
            const author = new Visitor({ name: "test" });
            const node = new Node({ name: "testworld", owner: author });
            const message = new Message({
                author,
                node,
                type: MessageType.CHAT,
                name: author.name,
                content: "hello world!",
            });
            expect(message).to.have.property("id").that.is.not.empty;
        });

        it("should return a safe copy", () => {
            const author = new Visitor({ name: "test" });
            const node = new Node({ name: "testworld", owner: author });
            const message = new Message({
                author,
                node,
                type: MessageType.CHAT,
                name: author.name,
                content: "hello world!",
            });
            const safe = message.safe();
            expect(safe).to.have.all.keys([
                "id",
                "author_id",
                "node_id",
                "type",
                "name",
                "content",
            ]);
        });
    });
});
