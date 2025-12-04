import {Pool} from "pg";


/**
 * Deletes a user profile and associated data from the database.
 *
 * This method removes all data related to a user from the following tables in the database:
 * - `psn.user_earned_trophy`
 * - `psn.user_played_title`
 * - `psn.user_profile`
 *
 * @param {Pool} pool - The database connection pool used to execute the queries.
 * @param {string} accountId - The unique identifier of the user whose data is to be deleted.
 * @return {Promise<any>} A promise that resolves when the delete operations are completed.
 */
export async function deleteUserProfile(
    pool: Pool,
    accountId: string
): Promise<any> {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const deleteUserEarnedTrophyQuery = await pool.query(`DELETE
                                                              FROM psn.user_earned_trophy
                                                              WHERE user_id = '${accountId}'`);
        const deleteUserPlayedTitleQuery = await pool.query(`DELETE
                                                             FROM psn.user_played_title
                                                             WHERE user_id = '${accountId}'`);
        const deleteUserProfileQuery = await pool.query(`DELETE
                                                         FROM psn.user_profile
                                                         WHERE id = '${accountId}'`);
        await client.query('COMMIT');


        console.log(`Deleted ${deleteUserEarnedTrophyQuery.rowCount} rows from psn.user_earned_trophy`);
        console.log(`Deleted ${deleteUserPlayedTitleQuery.rowCount} rows from psn.user_played_title`);
        console.log(`Deleted ${deleteUserProfileQuery.rowCount} rows from psn.user_profile`);
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }

}