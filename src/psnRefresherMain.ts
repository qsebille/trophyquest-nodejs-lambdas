import {getParams, Params} from "./config/params.js";
import {buildPostgresPool} from "./postgres/utils/buildPostgresPool.js";
import {Pool} from "pg";
import {getPsnAuthTokens, PsnAuthTokens} from "./auth/psnAuthTokens.js";
import {PsnUser} from "./psn/models/psnUser.js";
import {fetchPsnUser} from "./psn/fetchPsnUser.js";
import {fetchUserProfile} from "./postgres/fetchUserProfile.js";
import {PsnTitle} from "./psn/models/psnTitle.js";
import {fetchPsnTitles} from "./psn/fetchPsnTitles.js";
import {PostgresUserProfile} from "./postgres/models/postgresUserProfile.js";
import {upsertUserProfileIntoPostgres} from "./postgres/upsertUserProfileIntoPostgres.js";

async function main() {
    const startTime = Date.now();
    console.info("START PSN Refresher")

    const params: Params = getParams();
    const pool: Pool = buildPostgresPool();

    try {
        // Authenticate and fetch user data
        const psnAuthTokens: PsnAuthTokens = await getPsnAuthTokens(params.npsso);
        const psnUser: PsnUser = await fetchPsnUser(psnAuthTokens, params.profileName);
        const accountId: string = psnUser.id;

        // Fetch postgres user
        const userProfile: PostgresUserProfile = await fetchUserProfile(pool, accountId);
        const userLastUpdate = new Date(userProfile.updated_at);
        console.info(`Fetched user ${userProfile.name} (${accountId}) from postgres database`);
        console.info(`Last update: ${userLastUpdate.toISOString()}`);

        // Fetch titles
        const titles: PsnTitle[] = await fetchPsnTitles(psnAuthTokens, accountId);
        const titlesToUpdate = titles.filter(t => new Date(t.lastPlayedDateTime) > userLastUpdate);
        if (titlesToUpdate.length === 0) {
            console.info("No titles to update");

            // Insert user into postgres database to update refresh time
            await upsertUserProfileIntoPostgres(pool, psnUser);
        } else {
            console.info(`Found ${titlesToUpdate.length} titles to update, among ${titles.length} total titles`);
            // TODO: update titles and trophies
        }

        console.info("SUCCESS");
    } finally {
        const durationSeconds = (Date.now() - startTime) / 1000;
        console.info(`Total processing time: ${durationSeconds.toFixed(2)} s`);
        await pool.end();
    }
}

main().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
