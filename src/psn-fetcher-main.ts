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


async function main() {
    console.info("START PSN Fetcher v2")

    const params: Params = getParams();

    // Authenticate and add profile in database
    let authData: AuthData = await auth(params);
    await insertUserIntoPostgres(authData.userInfo, params);

    // Fetch titles and trophy sets
    const titlesResponseDTO: PsnTitlesTrophySetResponseDTO = await getTitlesData(authData);
    console.info(`Found ${titlesResponseDTO.titles.length} titles`);
    console.info(`Found ${titlesResponseDTO.trophySets.length} trophy sets`);
    await insertTitlesIntoPostgres(titlesResponseDTO.titles, params);
    await insertUserTitlesIntoPostgres(authData, titlesResponseDTO.titles, params);
    await insertTrophySetsIntoPostgres(titlesResponseDTO.trophySets, params);
    await insertTitlesTrophySetIntoPostgres(titlesResponseDTO.links, params);

    // Fetch trophies for each title
    const trophyResponseDTO: TrophyResponseDTO = await getTrophiesData(authData, titlesResponseDTO.trophySets);
    console.info(`Found ${trophyResponseDTO.trophies.length} trophies`);
    console.info(`Found ${trophyResponseDTO.earnedTrophies.length} earned trophies`);
    await insertTrophiesIntoPostgres(trophyResponseDTO.trophies, params);
    await insertEarnedTrophiesIntoPostgres(trophyResponseDTO.earnedTrophies, params);

    console.info("SUCCESS");
    process.exit(0);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
