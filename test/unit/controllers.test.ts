import * as typeorm from "typeorm";

import { stub, SinonStub } from "sinon";
import { assert } from "chai";

import * as VisitorController from "../../src/controllers/visitors";

import { Request, Response } from "express";

describe("Controllers", () => {
    describe("Visitors", () => {
        describe("[GET] /", () => {
            it("should return an array of visitors", () => {
                const connection_stub = stub(typeorm, "getConnection");
                const req: Partial<Request> = { };
                const res: Partial<Response> = { };
                VisitorController.getVisitors(req as Request, res as Response, () => {});
                
            });
        });
    });
});