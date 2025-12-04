import {Pool} from "pg";
import {buildPostgresInsertPlaceholders} from "../utils/buildPostgresInsertPlaceholders.js";
import {PsnTitleTrophySet} from "../../psn/models/psnTitleTrophySet.js";
import {InsertQueryResult} from "../models/insertQueryResult.js";


/**
 * Inserts a batch of PlayStation Network (PSN) title-trophy set links into the database.
 * If a title-trophy set link already exists in the database, it will be ignored during insertion.
 *
 * @param {Pool} pool - The database connection pool used to execute the query.
 * @param {PsnTitleTrophySet[]} psnTitleTrophySets - An array of objects containing the title ID and trophy set ID pairs to insert.
 * @return {Promise<InsertQueryResult>} A promise that resolves to an object containing the count of inserted and ignored rows.
 */
export async function insertPsnTitlesTrophySet(
    pool: Pool,
    psnTitleTrophySets: PsnTitleTrophySet[]
): Promise<InsertQueryResult> {
    if (psnTitleTrophySets.length === 0) {
        console.info("No title-trophy-set links to insert into postgres database.");
        return {rowsInserted: 0, rowsIgnored: 0};
    }

    const values: string[] = [];
    const placeholders: string = psnTitleTrophySets.map((
        link,
        idx
    ) => {
        const currentValues = [link.titleId, link.trophySetId];
        values.push(...currentValues);
        return buildPostgresInsertPlaceholders(currentValues, idx);
    }).join(',');

    const insert = await pool.query(`
        INSERT INTO psn.title_trophy_set (title_id, trophy_set_id)
        VALUES
            ${placeholders} ON CONFLICT (title_id,trophy_set_id)
        DO NOTHING
    `, values);

    const nbInserted = insert.rowCount ?? 0;
    const nbIgnored = psnTitleTrophySets.length - nbInserted;
    return {
        rowsInserted: nbInserted,
        rowsIgnored: nbIgnored,
    }
}