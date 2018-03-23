import { EntityManager } from "typeorm";
import { Context } from "koa";

declare module "koa" {
    interface Context {
        db: EntityManager;
    }
}