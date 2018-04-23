import { assert } from "chai";
import { NextFunction, Request, Response } from "express";
import { assert as s_assert, spy, stub } from "sinon";

import * as jwt_utils from "../../src/utils/jwt.utils";

import { isLoggedIn } from "../../src/middlewares/auth";
import { isNodeOwner } from "../../src/middlewares/permissions";
import { readToken, signToken } from "../helpers/jwt";

describe("Middlewares", () => {
    describe("Auth", () => {
        describe("isLoggedIn", () => {
            it("should pass if auth token is present", async () => {
                const req: Partial<Request> = {
                    signedCookies: { visitor_session: await signToken("fake user") },
                };
                const res: Partial<Response> = { clearCookie: spy() };
                const next = spy();
                const readStub = stub(jwt_utils, "readToken").callsFake(readToken);
                await isLoggedIn(req as Request, res as Response, next);
                s_assert.alwaysCalledWithExactly(next);
                readStub.restore();
            });

            it("should fail if auth token is invalid or not present", async () => {
                const req: Partial<Request> = {
                    signedCookies: { visitor_session: "invalid token" },
                };
                const res: Partial<Response> = { clearCookie: spy() };
                const next = spy();
                const readStub = stub(jwt_utils, "readToken").callsFake(readToken);
                const authStub = spy(isLoggedIn);
                authStub(req as Request, res as Response, next);
                assert(authStub.threw, "middleware did not fail");
                readStub.restore();
            });
        });
    });

    describe("Permissions", () => {
        describe("isNodeOwner", () => {
            it("should pass if visitor id equals node owner id", () => {
                const req: Partial<Request> = {
                    visitor: { id: "test id" } as any,
                    ctxNode: { owner_id: "test id" } as any,
                };
                const res: Partial<Response> = { clearCookie: spy() };
                const next = spy();
                isNodeOwner(req as Request, res as Response, next);
                assert(next.calledOnceWithExactly(), "middleware did not pass");
            });
        });
    });
});
