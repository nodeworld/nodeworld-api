import { assert, expect } from "chai";
import { NextFunction, Request, Response } from "express";
import { SinonSpy, SinonStub, spy, stub } from "sinon";
import * as typeorm from "typeorm";

import * as VisitorController from "../../src/controllers/visitors";
import { Visitor } from "../../src/models/visitor";
import * as jwt_utils from "../../src/utils/jwt.utils";
import { dbData, manStub, repoStub } from "../helpers/db";
import { readToken } from "../helpers/jwt";

describe("Controllers", () => {
    let repositoryStub: SinonStub;
    let managerStub: SinonStub;
    let readTokenStub: SinonStub;
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    before(() => {
        repositoryStub = stub(typeorm, "getRepository").returns(repoStub);
        managerStub = stub(typeorm, "getManager").returns(manStub);
        readTokenStub = stub(jwt_utils, "readToken").callsFake(readToken);
    });

    beforeEach(() => {
        req = { query: {}, body: {} };
        res = { json: spy(), clearCookie: spy(), status: stub().returnsThis(), send: spy() };
        next = spy();
    });

    after(() => {
        repositoryStub.restore();
        readTokenStub.restore();
    });

    describe("Visitors", () => {
        describe("[GET] /", () => {
            let controllerSpy: SinonSpy;

            before(() => {
                controllerSpy = spy(VisitorController.getVisitors);
            });

            it("should return an array of visitors", async () => {
                await controllerSpy(req as Request, res as Response, next);
                expect(res.json).to.have.been.calledWithExactly({ visitors: dbData.visitors });
            });

            it("should respect skipping", async () => {
                req.query = { skip: 1 };
                await controllerSpy(req as Request, res as Response, next);
                expect(res.json).to.have.been.calledWithExactly(
                    { visitors: dbData.visitors.slice(1) },
                );
            });

            it("should respect limiting", async () => {
                req.query = { limit: 1 };
                await controllerSpy(req as Request, res as Response, next);
                expect(res.json).to.have.been.calledWithExactly(
                    { visitors: dbData.visitors.slice(0, 1) },
                );
            });

            it("should respect skipping and limiting", async () => {
                req.query = { skip: 1, limit: 1 };
                await controllerSpy(req as Request, res as Response, next);
                expect(res.json).to.have.been.calledWithExactly(
                    { visitors: dbData.visitors.slice(1, 2) },
                );
            });
        });

        describe("[GET] /me", () => {
            it("should return the current visitor", async () => {
                const controllerSpy = spy(VisitorController.getMe);
                req.visitor = dbData.visitors[0];
                await controllerSpy(req as Request, res as Response, next);
                expect(res.json).to.have.been.calledWithExactly(req.visitor);
            });
        });

        describe("[GET] /logout", () => {
            it("should delete the auth token", async () => {
                const controllerSpy = spy(VisitorController.getLogout);
                req.cookies = { visitor_session: "randomtoken" };
                await controllerSpy(req as Request, res as Response, next);
                expect(res.clearCookie).to.have.been.calledWithExactly("visitor_session");
                expect(res.send).to.have.been.called;
            });
        });

        describe("[GET] /:visitor_id", () => {
            it("should return a visitor", async () => {
                const controllerSpy = spy(VisitorController.getVisitorID);
                req.ctxVisitor = dbData.visitors[1] as Visitor;
                await controllerSpy(req as Request, res as Response, next);
                expect(res.json).to.have.been.calledWithExactly(req.ctxVisitor);
            });
        });

        describe("[POST] /", () => {
            it("should return a visitor and a node", async () => {
                const controllerSpy = spy(VisitorController.postVisitor);
                const visitor = { name: "test", email: "test@gmail.com", password: "test" };
                const partialNode = { name: visitor.name };
                req.body = { name: "test", email: "test@gmail.com", password: "test" };
                await controllerSpy(req as Request, res as Response, next);
                expect(res.json).to.have.been.calledWithMatch(
                    { visitor: { name: "test", email: "test@gmail.com" }, node: partialNode },
                );
            });
        });

        describe("[POST] /login", () => {
            it("should return a visitor", async () => {
                // pass
            });
        });
    });
});
