import {Pool} from "pg";
import {buildPostgresInsertPlaceholders} from "../utils/buildPostgresInsertPlaceholders.js";
import {PsnUserPlayedTitle} from "../../psn/models/psnUserPlayedTitle.js";
import {InsertQueryResult} from "../models/insertQueryResult.js";


/**
 * Inserts or updates PlayStation Network (PSN) user-played titles in the database.
 *
 * If the combination of `userId` and `titleId` already exists in the database, this method updates the `lastPlayedDateTime`.
 * Otherwise, it inserts a new record. If no titles are provided, no action is performed, and the method returns early.
 *
 * @param {Pool} pool - The PostgreSQL connection pool used to execute the query.
 * @param {PsnUserPlayedTitle[]} playedTitles - An array of user-played title objects, each containing `userId`, `titleId`, and `lastPlayedDateTime`.
 * @return {Promise<InsertQueryResult>} A promise that resolves to an object containing `rowsInserted` (number of rows successfully inserted) and `rowsIgnored` (number of rows ignored, currently always 0).
 */
export async function upsertPsnUserPlayedTitles(
    pool: Pool,
    playedTitles: PsnUserPlayedTitle[]
): Promise<InsertQueryResult> {
    if (playedTitles.length === 0) {
        console.info("No user titles to insert into postgres database.");
        return {rowsInserted: 0, rowsIgnored: 0};
    }

    const values: string[] = [];
    const placeholders: string = playedTitles.map((
        playedTitle,
        idx
    ) => {
        const currentValues = [playedTitle.userId, playedTitle.titleId, playedTitle.lastPlayedDateTime];
        values.push(...currentValues);
        return buildPostgresInsertPlaceholders(currentValues, idx);
    }).join(',');

    const insert = await pool.query(`
        INSERT INTO psn.user_played_title (user_id, title_id, last_played_at)
        VALUES
            ${placeholders} ON CONFLICT (user_id,title_id)
        DO
        UPDATE SET last_played_at=EXCLUDED.last_played_at
    `, values);

    return {
        rowsInserted: insert.rowCount ?? 0,
        rowsIgnored: 0,
    }
}