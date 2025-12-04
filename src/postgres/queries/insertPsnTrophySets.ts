import {Pool} from "pg";
import {buildPostgresInsertPlaceholders} from "../utils/buildPostgresInsertPlaceholders.js";
import {PsnTrophySet} from "../../psn/models/psnTrophySet.js";
import {InsertQueryResult} from "../models/insertQueryResult.js";


/**
 * Inserts an array of PSN trophy sets into the database using a provided connection pool.
 * Handles potential conflicts by ignoring duplicates based on the `id` field.
 *
 * @param {Pool} pool - The database connection pool used to execute the insertion query.
 * @param {PsnTrophySet[]} psnTrophySets - An array of trophy sets to be inserted into the database.
 * @return {Promise<InsertQueryResult>} A promise resolving to an object containing the number of rows successfully inserted (`rowsInserted`)
 * and the number of rows ignored due to conflicts (`rowsIgnored`).
 */
export async function insertPsnTrophySets(
    pool: Pool,
    psnTrophySets: PsnTrophySet[]
): Promise<InsertQueryResult> {
    if (psnTrophySets.length === 0) {
        console.info("No trophy-sets to insert into postgres database.");
        return {rowsInserted: 0, rowsIgnored: 0};
    }

    const values: string[] = [];
    const placeholders: string = psnTrophySets.map((
        ts,
        idx
    ) => {
        const currentValues = [ts.id, ts.name, ts.platform, ts.version, ts.serviceName, ts.iconUrl];
        values.push(...currentValues);
        return buildPostgresInsertPlaceholders(currentValues, idx);
    }).join(',');

    const insert = await pool.query(`
        INSERT INTO psn.trophy_set (id, name, platform, version, service_name, icon_url)
        VALUES
            ${placeholders} ON CONFLICT (id)
        DO NOTHING
    `, values);

    const nbInserted = insert.rowCount ?? 0;
    const nbIgnored = psnTrophySets.length - nbInserted;
    return {
        rowsInserted: nbInserted,
        rowsIgnored: nbIgnored
    };
}