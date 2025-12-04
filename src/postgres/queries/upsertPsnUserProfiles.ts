import {Pool} from "pg";
import {PsnUser} from "../../psn/models/psnUser.js";
import {buildPostgresInsertPlaceholders} from "../utils/buildPostgresInsertPlaceholders.js";
import {InsertQueryResult} from "../models/insertQueryResult.js";


/**
 * Inserts or updates PlayStation Network (PSN) user profiles into the database.
 * If a user profile with the same ID already exists, the `avatar_url` field is updated.
 *
 * @param {Pool} pool - The database connection pool used to execute the query.
 * @param {PsnUser[]} users - An array of PSN user objects to insert or update in the database.
 * Each user object should include an `id`, `profileName`, and optionally an `avatarUrl`.
 * @return {Promise<InsertQueryResult>} A promise that resolves to an object containing the number of rows inserted
 * and rows ignored during the operation.
 */
export async function upsertPsnUserProfiles(
    pool: Pool,
    users: PsnUser[],
): Promise<InsertQueryResult> {
    if (users.length === 0) {
        console.warn("No user profiles to insert into postgres database.");
        return {
            rowsInserted: 0,
            rowsIgnored: 0,
        };
    }

    const values: string[] = [];
    const placeholders: string = users.map((
        user,
        idx
    ) => {
        const currentValues = [user.id, user.profileName, user.avatarUrl ?? ""];
        values.push(...currentValues);
        return buildPostgresInsertPlaceholders(currentValues, idx);
    }).join(',');

    const insert = await pool.query(`
        INSERT INTO psn.user_profile (id, name, avatar_url)
        VALUES
            ${placeholders} ON CONFLICT (id)
        DO
        UPDATE SET avatar_url=EXCLUDED.avatar_url
    `, values);

    return {
        rowsInserted: insert.rowCount ?? 0,
        rowsIgnored: 0
    }
}