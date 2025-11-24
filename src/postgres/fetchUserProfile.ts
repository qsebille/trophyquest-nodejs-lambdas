import {Pool} from "pg";
import {PostgresUserProfile} from "./models/postgresUserProfile.js";


/**
 * Fetches a user profile from the PostgreSQL database using the specified account ID.
 *
 * @param {Pool} pool - The database connection pool to execute the query.
 * @param {string} accountId - The ID of the account for which the user profile is to be fetched.
 * @return {Promise<PostgresUserProfile>} A promise that resolves to the fetched user profile object.
 */
export async function fetchUserProfile(pool: Pool, accountId: string): Promise<PostgresUserProfile> {
    const userQueryResult = await pool.query(`SELECT *
                                              FROM psn.user_profile
                                              WHERE id = $1`, [accountId]);
    if (userQueryResult.rows.length === 0) {
        console.error(`User ${accountId} not found in postgres database`);
        process.exit(1);
    }

    return userQueryResult.rows[0];
}