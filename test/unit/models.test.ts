import { assert } from "chai";
import { spy, assert as s_assert } from "sinon";

import { Visitor } from "../../src/models/visitor";
import { Node } from "../../src/models/node";
import { Message, MessageType } from "../../src/models/message";

describe("Models", () => {
    describe("Visitor", () => {
        it("should create and return a visitor", () => {
            const visitor = new Visitor({ name: "test" });
            assert.containsAllKeys(visitor, ["id", "name"], "visitor does not contain necessary properties");
        });

        it("should generate an id", () => {
            const visitor = new Visitor({ name: "test" });
            assert.property(visitor, "id", "visitor does not contain id property");
            assert.isNotEmpty(visitor.id, "visitor id property is empty");
        });

        it("should generate a password", async () => {
            const visitor = new Visitor({ name: "test" });
            await visitor.setPassword("test");
            assert.isNotEmpty(visitor.password_hash, "visitor password hash is empty");
            assert.isNotEmpty(visitor.password_salt, "visitor password salt is empty");
        });

        it("should successfully authenticate", async () => {
            const visitor = new Visitor({ name: "test" });
            const auth_spy = spy(visitor, "authenticate");
            await visitor.setPassword("test");
            await visitor.authenticate("test");
            assert(await auth_spy.firstCall.returnValue === true, "authentication was rejected");
            auth_spy.restore();
        });

        it("should return a safe copy", async () => {
            const visitor = new Visitor({ name: "test" });
            await visitor.setPassword("test");
            const safe = visitor.safe();
            assert.hasAllKeys(safe, ["id", "name", "email"], "safe copy does not have necessary properties");
        });
    });

    describe("Node", () => {
        it("should create and return a node", () => {
            const owner = new Visitor({ name: "test" });
            const node = new Node({ name: "testworld", owner });
            assert.containsAllKeys(node, ["id", "owner", "name", "greeting"], "node does not contain necessary properties");
        });

        it("should generate an id", () => {
            const owner = new Visitor({ name: "test" });
            const node = new Node({ name: "testworld", owner });
            assert.property(node, "id", "node does not contain id property");
            assert.isNotEmpty(node.id, "node id is empty");
        });

        it("should return a safe copy", async () => {
            const owner = new Visitor({ name: "test" });
            const node = new Node({ name: "testworld", owner });
            const safe = node.safe();
            assert.hasAllKeys(safe, ["id", "name", "greeting", "owner_id"], "safe copy does not have necessary properties");
        });
    });

    describe("Message", () => {
        it("should create and return a message", () => {
            const author = new Visitor({ name: "test" });
            const node = new Node({ name: "testworld", owner: author });
            const message = new Message({ author, node, type: MessageType.CHAT, name: author.name, content: "hello world!" });
            assert.containsAllKeys(message, ["id", "author", "node", "type", "name", "content"], "message does not contain necessary properties");
        });

        it("should generate an id", () => {
            const author = new Visitor({ name: "test" });
            const node = new Node({ name: "testworld", owner: author });
            const message = new Message({ author, node, type: MessageType.CHAT, name: author.name, content: "hello world!" });
            assert.property(message, "id", "message does not contain id property");
            assert.isNotEmpty(message.id, "message id is empty");
        });

        it("should return a safe copy", () => {
            const author = new Visitor({ name: "test" });
            const node = new Node({ name: "testworld", owner: author });
            const message = new Message({ author, node, type: MessageType.CHAT, name: author.name, content: "hello world!" });
            const safe = message.safe();
            assert.hasAllKeys(safe, ["id", "author_id", "node_id", "type", "name", "content"], "message does not have necessary properties");
        });
    });
});