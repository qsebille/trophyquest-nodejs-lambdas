import {Params} from "../utils/params.js";
import {Pool} from "pg";

export function postgresUtils(params: Params): Pool {
    return new Pool({
        host: params.postgresHost,
        port: params.postgresPort,
        user: params.postgresUser,
        password: params.postgresPassword,
        database: params.postgresDatabase,
        ssl: params.postgresSsl === "true" ? {rejectUnauthorized: false} : undefined,
    });
}

export function buildInsertPlaceholders(array: string[], idx: number): string {
    const length = array.length;
    const base = idx * length;

    let stringBuffer: string[] = ["("];
    for (let i = 0; i < length; i++) {
        stringBuffer.push(`$${base + i + 1}`)
        if (i === length - 1) {
            stringBuffer.push(")");
        } else {
            stringBuffer.push(", ");
        }
    }

    return stringBuffer.join("");
}