import { expect } from "chai";
import { NextFunction, Request, Response } from "express";
import { SinonSpy, SinonStub, spy, stub } from "sinon";

import * as jwt_utils from "../../src/utils/jwt.utils";

import { isLoggedIn } from "../../src/middlewares/auth";
import { isNodeOwner } from "../../src/middlewares/permissions";
import { readToken, signToken } from "../helpers/jwt";

describe("Middlewares", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: SinonSpy;

    beforeEach(() => {
        req = { signedCookies: {} };
        res = { clearCookie: spy() };
        next = spy();
    });

    describe("Auth", () => {
        let readStub: SinonStub;

        before(() => {
            readStub = stub(jwt_utils, "readToken").callsFake(readToken);
        });

        after(() => {
            readStub.restore();
        });

        describe("isLoggedIn", () => {
            it("should pass if auth token is present", async () => {
                req.signedCookies = { visitor_session: await signToken("fake user") };
                await isLoggedIn(req as Request, res as Response, next);
                expect(next).to.have.been.calledWithExactly();
            });

            it("should fail if auth token is invalid or not present", async () => {
                req.signedCookies = { visitor_session: "invalid token" };
                await isLoggedIn(req as Request, res as Response, next);
                expect(next).not.to.have.been.calledWithExactly();
            });
        });
    });

    describe("Permissions", () => {
        describe("isNodeOwner", () => {
            it("should pass if visitor id equals node owner id", async () => {
                req.visitor = { id: "test id" } as any;
                req.ctxNode = { owner_id: "test id" } as any;
                await isNodeOwner(req as Request, res as Response, next);
                expect(next).to.have.been.calledWithExactly();
            });
        });
    });
});
