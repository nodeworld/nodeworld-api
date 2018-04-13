import { stub, spy, assert as s_assert } from "sinon";
import { assert } from "chai";
import { Request, Response, NextFunction } from "express";

import * as jwt_utils from "../../src/utils/jwt.utils";

import { isLoggedIn } from "../../src/middlewares/auth";
import { isNodeOwner } from "../../src/middlewares/permissions";
import { signToken, readToken } from "../helpers/jwt";

describe("Middlewares", () => {
    describe("Auth", () => {
        describe("isLoggedIn", () => {
            it("should pass if auth token is present", async () => {
                const req: Partial<Request> = { cookies: { visitor_session: await signToken("fake user") } };
                const res: Partial<Response> = { clearCookie: spy() };
                const next = spy();
                const read_stub = stub(jwt_utils, "readToken").callsFake(readToken);
                await isLoggedIn(req as Request, res as Response, next);
                assert(next.calledOnceWithExactly(), "middleware did not pass");
                read_stub.restore();
            });

            it("should fail if auth token is invalid or not present", async () => {
                const req: Partial<Request> = { cookies: { visitor_session: "invalid token" } };
                const res: Partial<Response> = { clearCookie: spy() };
                const next = spy();
                const read_stub = stub(jwt_utils, "readToken").callsFake(readToken);
                const auth_stub = spy(isLoggedIn)
                auth_stub(req as Request, res as Response, next);
                assert(auth_stub.threw, "middleware did not fail");
                read_stub.restore();
            });
        });
    });

    describe("Permissions", () => {
        describe("isNodeOwner", () => {
            it("should pass if visitor id equals node owner id", () => {
                const req: Partial<Request> = { visitor: { id: "test id" } as any, ctx_node: { owner_id: "test id" } as any };
                const res: Partial<Response> = { clearCookie: spy() };
                const next = spy();
                isNodeOwner(req as Request, res as Response, next);
                assert(next.calledOnceWithExactly(), "middleware did not pass");
            });
        });
    });
});