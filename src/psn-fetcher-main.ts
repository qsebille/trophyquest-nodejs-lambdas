import {auth, AuthData} from "./modules/auth.js";
import {getParams, Params} from "./modules/params.js";
import {getTitlesData, PsnTitlesTrophySetResponseDTO} from "./modules/psn-titles-trophy-sets.js";
import {insertUserIntoPostgres} from "./modules/postgres/insert-user.js";
import {insertTitlesIntoPostgres, insertUserTitlesIntoPostgres} from "./modules/postgres/insert-titles.js";
import {
    insertTitlesTrophySetIntoPostgres,
    insertTrophySetsIntoPostgres
} from "./modules/postgres/insert-trophy-sets.js";
import {getTrophiesData, TrophyResponseDTO} from "./modules/psn-trophy.js";
import {insertEarnedTrophiesIntoPostgres, insertTrophiesIntoPostgres} from "./modules/postgres/insert-trophies.js";
import {buildPsnFetcherPool} from "./modules/postgres/pool.js";
import {Pool} from "pg";


async function main() {
    console.info("START PSN Fetcher v2")

    const params: Params = getParams();
    const pool: Pool = buildPsnFetcherPool(params);

    try {
        // Authenticate and add profile in database
        let authData: AuthData = await auth(params);
        await insertUserIntoPostgres(pool, authData.userInfo);

        // Fetch titles and trophy sets
        const titlesResponseDTO: PsnTitlesTrophySetResponseDTO = await getTitlesData(authData);
        console.info(`Found ${titlesResponseDTO.titles.length} titles`);
        console.info(`Found ${titlesResponseDTO.trophySets.length} trophy sets`);
        await insertTitlesIntoPostgres(pool, titlesResponseDTO.titles);
        await insertUserTitlesIntoPostgres(pool, authData, titlesResponseDTO.titles);
        await insertTrophySetsIntoPostgres(pool, titlesResponseDTO.trophySets);
        await insertTitlesTrophySetIntoPostgres(pool, titlesResponseDTO.links);

        // Fetch trophies for each title
        const trophyResponseDTO: TrophyResponseDTO = await getTrophiesData(authData, titlesResponseDTO.trophySets);
        console.info(`Found ${trophyResponseDTO.trophies.length} trophies`);
        console.info(`Found ${trophyResponseDTO.earnedTrophies.length} earned trophies`);
        await insertTrophiesIntoPostgres(pool, trophyResponseDTO.trophies);
        await insertEarnedTrophiesIntoPostgres(pool, trophyResponseDTO.earnedTrophies);

        console.info("SUCCESS");
    } finally {
        await pool.end();
    }
}

main().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
