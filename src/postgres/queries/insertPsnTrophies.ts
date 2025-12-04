import {Pool} from "pg";
import {PsnTrophy} from "../../psn/models/psnTrophy.js";
import {buildPostgresInsertPlaceholders} from "../utils/buildPostgresInsertPlaceholders.js";
import {InsertQueryResult} from "../models/insertQueryResult.js";


/**
 * Inserts a batch of PlayStation trophies into a PostgreSQL database. The method processes the trophies in batches and uses
 * prepared statements to improve performance. Duplicate entries are ignored based on the `id` field.
 *
 * @param {Pool} pool - The PostgreSQL database connection pool used to execute the queries.
 * @param {PsnTrophy[]} trophies - An array of PSN trophies to be inserted into the database.
 * @return {Promise<InsertQueryResult>} A promise resolving to an object containing the counts of inserted rows (`rowsInserted`)
 * and ignored rows (`rowsIgnored`).
 */
export async function insertPsnTrophies(
    pool: Pool,
    trophies: PsnTrophy[]
): Promise<InsertQueryResult> {
    if (trophies.length === 0) {
        console.info("No trophies to insert into postgres database.");
        return {rowsInserted: 0, rowsIgnored: 0};
    }

    const batchSize: number = trophies.length > 1000 ? 1000 : trophies.length;
    let nbIgnored: number = 0;
    let nbInserted: number = 0;

    for (let i = 0; i < trophies.length; i += batchSize) {
        const batch = trophies.slice(i, i + batchSize);
        const values: string[] = [];
        const placeholders: string = batch.map((
            t,
            idx
        ) => {
            const currentValues: string[] = [
                t.id,
                t.trophySetId,
                t.rank.toString(),
                t.title,
                t.detail,
                t.isHidden.toString(),
                t.trophyType,
                t.iconUrl,
                t.groupId,
            ];
            values.push(...currentValues);
            return buildPostgresInsertPlaceholders(currentValues, idx);
        }).join(',');

        const insert = await pool.query(`
            INSERT INTO psn.trophy (id, trophy_set_id, rank, title, detail, is_hidden, trophy_type, icon_url,
                                    game_group_id)
            VALUES
                ${placeholders} ON CONFLICT (id)
            DO NOTHING
        `, values);

        nbInserted += insert.rowCount ?? 0;
        nbIgnored += (batch.length - (insert.rowCount ?? 0));
    }

    return {rowsInserted: nbInserted, rowsIgnored: nbIgnored};
}