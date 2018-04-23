import * as ioredis from "ioredis";

export const redis = new ioredis(process.env.REDIS_ENDPOINT);
