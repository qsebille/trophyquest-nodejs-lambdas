import {Pool} from "pg";
import {Params} from "../params.js";

export function buildPsnFetcherPool(params: Params): Pool {
    return new Pool({
        host: params.postgresHost,
        port: params.postgresPort,
        user: params.postgresUser,
        password: params.postgresPassword,
        database: params.postgresDatabase,
        ssl: params.postgresSsl === "true" ? {rejectUnauthorized: false} : undefined,
    });
}