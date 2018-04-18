import * as typeorm from "typeorm";

import { stub, spy, SinonStub, SinonSpy, assert as s_assert } from "sinon";
import { assert, expect } from "chai";
import { Request, Response } from "express";

import * as VisitorController from "../../src/controllers/visitors";
import * as jwt_utils from "../../src/utils/jwt.utils";

import { Visitor } from "../../src/models/visitor";
import { repo_stub, man_stub, db_data } from "../helpers/db";
import { readToken } from "../helpers/jwt";

describe("Controllers", () => {
    let repository_stub: SinonStub;
    let manager_stub: SinonStub;
    let read_token_stub: SinonStub
    let req: Partial<Request>;
    let res: Partial<Response>;

    before(() => {
        repository_stub = stub(typeorm, "getRepository").returns(repo_stub);
        manager_stub = stub(typeorm, "getManager").returns(man_stub);
        read_token_stub = stub(jwt_utils, "readToken").callsFake(readToken);
    });

    beforeEach(() => {
        req = { query: {}, body: {} };
        res = { json: spy(), clearCookie: spy(), status: stub().returnsThis(), send: spy() };
    });

    after(() => {
        repository_stub.restore();
        read_token_stub.restore();
    });

    describe.only("Visitors", () => {
        describe("[GET] /", () => {
            let controller_spy: SinonSpy;

            before(() => {
                controller_spy = spy(VisitorController.getVisitors);
            });

            it("should return an array of visitors", async () => {
                await controller_spy(req as Request, res as Response, () => {});
                assert(!controller_spy.threw(), "controller should not throw");
                s_assert.calledWithExactly(res.json as SinonSpy, { visitors: db_data.visitors });
            });

            it("should respect skipping", async () => {
                req.query = { skip: 1 };
                await controller_spy(req as Request, res as Response, () => {});
                assert(!controller_spy.threw(), "controller should not throw");
                s_assert.calledWithExactly(res.json as SinonSpy, { visitors: db_data.visitors.slice(1) });
            });

            it("should respect limiting", async () => {
                req.query = { limit: 1 };
                await controller_spy(req as Request, res as Response, () => {});
                assert(!controller_spy.threw(), "controller should not throw");
                s_assert.calledWithExactly(res.json as SinonSpy, { visitors: db_data.visitors.slice(0, 1) });
            });

            it("should respect skipping and limiting", async () => {
                req.query = { skip: 1, limit: 1 };
                await controller_spy(req as Request, res as Response, () => {});
                assert(!controller_spy.threw(), "controller should not throw");
                s_assert.calledWithExactly(res.json as SinonSpy, { visitors: db_data.visitors.slice(1, 2) });
            });
        });

        describe("[GET] /me", () => {
            it("should return the current visitor", async () => {
                let controller_spy = spy(VisitorController.getMe);
                req.visitor = db_data.visitors[0];
                await controller_spy(req as Request, res as Response, () => {});
                assert(!controller_spy.threw(), "controller should not throw");
                s_assert.calledWithExactly(res.json as SinonSpy, req.visitor);
            });
        });

        describe("[GET] /logout", () => {
            it("should delete the auth token", async () => {
                let controller_spy = spy(VisitorController.getLogout);
                req.cookies = { visitor_session: "randomtoken" };
                await controller_spy(req as Request, res as Response, () => {});
                assert(!controller_spy.threw(), "controller should not throw");
                s_assert.calledWithExactly(res.clearCookie as SinonSpy, "visitor_session");
                s_assert.calledWithExactly(res.send as SinonSpy);
            });
        });

        describe("[GET] /:visitor_id", () => {
            it("should return a visitor from the request context", async () => {
                let controller_spy = spy(VisitorController.getVisitorID);
                req.ctx_visitor = db_data.visitors[1] as Visitor;
                await controller_spy(req as Request, res as Response, () => {});
                assert(!controller_spy.threw(), "controller should not throw");
                s_assert.calledWithExactly(res.json as SinonSpy, req.ctx_visitor);
            });
        });

        describe("[POST] /", () => {
            let controller_spy: SinonSpy;

            before(async () => {
                controller_spy = spy(VisitorController.postVisitor);
                req.body = { name: "test", email: "test@gmail.com", password: "test" };
                await controller_spy(req as Request, res as Response, () => {});
            });

            it("should create and save a new visitor", async () => {
                //expect(db_data.visitors.length).to.be.greaterThan(old_length);
                //expect(db_data.visitors[old_length]).to.have.keys(["id", "name", "email"]);
            });

            it("should create and save a new node", async () => {
                //expect(db_data.nodes.length).to.be.gr
            });
        });
    });
});