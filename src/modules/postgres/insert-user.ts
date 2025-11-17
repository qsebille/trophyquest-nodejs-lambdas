import {UserTQ} from "../psn-user.js";
import {postgresUtils} from "./postgres-utils.js";
import {Params} from "../utils/params.js";

export async function insertUserIntoPostgres(user: UserTQ, params: Params): Promise<any> {
    const pool = postgresUtils(params);
    const insert = await pool.query(
        `
            INSERT INTO public.psn_user (id, profile_name, avatar_url)
            VALUES ($1, $2, $3)
            ON CONFLICT (id) DO NOTHING
        `,
        [user.id, user.profileName, user.avatarUrl]
    );

    if (insert.rowCount === 0) {
        console.info(`User ${user.profileName} already in postgres database`);
    } else {
        console.info(`Inserted user ${user.profileName} into postgres database`);
    }
}