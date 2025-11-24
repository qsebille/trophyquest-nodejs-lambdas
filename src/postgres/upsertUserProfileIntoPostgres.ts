import {Pool} from "pg";
import {PsnUser} from "../psn/models/psnUser.js";

/**
 * Inserts a user's profile information into the PostgreSQL database. If the user already exists, updates the avatar URL.
 *
 * @param {Pool} pool - The PostgreSQL connection pool to execute the query.
 * @param {PsnUser} user - The user object containing the profile information. It should include the user ID, profile name, and avatar URL.
 * @return {Promise<any>} - A promise that resolves when the query is executed. The promise contains the result of the query execution.
 */
export async function upsertUserProfileIntoPostgres(pool: Pool, user: PsnUser): Promise<any> {
    const insert = await pool.query(
        `
            INSERT INTO psn.user_profile (id, name, avatar_url)
            VALUES ($1, $2, $3) ON CONFLICT (id)
            DO
            UPDATE SET avatar_url=EXCLUDED.avatar_url
        `,
        [user.id, user.profileName, user.avatarUrl]
    );

    if (insert.rowCount === 0) {
        console.info(`User ${user.profileName} already in postgres database`);
    } else {
        console.info(`Inserted user ${user.profileName} into postgres database`);
    }
}