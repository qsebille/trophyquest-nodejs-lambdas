import {buildPostgresPool} from "./postgres/utils/buildPostgresPool.js";
import {Pool} from "pg";
import {getAuthorizationPayload} from "./auth/psnAuthTokens.js";
import {getMandatoryParam} from "./config/getMandatoryParam.js";
import {AuthorizationPayload} from "psn-api";
import {selectRefreshProfiles} from "./postgres/select/selectRefreshProfiles.js";
import {Player} from "./models/Player.js";
import {getUserProfile} from "./psn/helpers/getUserProfile.js";
import {fetchUserGamesAndEditions} from "./psn/helpers/fetchUserGamesAndEditions.js";
import {fetchEditionTrophySuiteLinks} from "./psn/helpers/fetchEditionTrophySuiteLinks.js";
import {fetchTrophySuites} from "./psn/helpers/fetchTrophySuites.js";
import {fetchTrophies} from "./psn/helpers/fetchTrophies.js";
import {insertIntoTrophyQuestDatabase} from "./postgres/insertIntoTrophyQuestDatabase.js";
import {PlayedGame} from "./models/PlayedGame.js";
import {PlayedEdition} from "./models/PlayedEdition.js";
import {PlayedTrophySuite} from "./models/PlayedTrophySuite.js";
import {EditionTrophySuiteLink} from "./models/EditionTrophySuiteLink.js";
import {TrophySuiteGroup} from "./models/TrophySuiteGroup.js";
import {Trophy} from "./models/Trophy.js";
import {EarnedTrophy} from "./models/EarnedTrophy.js";


async function runRefresher(): Promise<void> {
    const startTime = Date.now();
    console.info("PSN Refresher: Start");

    const npsso: string = getMandatoryParam('NPSSO');
    const concurrency: number = Number(getMandatoryParam('CONCURRENCY'));
    const pool: Pool = buildPostgresPool();

    try {
        // Auth
        const auth: AuthorizationPayload = await getAuthorizationPayload(npsso);

        // List of profiles with the last earned trophy timestamp to refresh
        const profiles = await selectRefreshProfiles(pool);

        const playerList: Player[] = [];
        const playedGameList: PlayedGame[] = [];
        const playedEditionList: PlayedEdition[] = [];
        const playedTrophySuiteList: PlayedTrophySuite[] = [];
        const editionTrophySuiteLinkList: EditionTrophySuiteLink[] = [];
        const trophySuiteGroupList: TrophySuiteGroup[] = [];
        const trophyList: Trophy[] = [];
        const earnedTrophyList: EarnedTrophy[] = [];

        for (let profile of profiles) {
            const player: Player = await getUserProfile(auth, profile.pseudo);
            console.info(`Refreshing PSN data for profile ${profile.pseudo}`);
            const accountId: string = player.id;

            // Fetch data from PSN API (from last earned trophy timestamp)
            const playedGamesAndEditions = await fetchUserGamesAndEditions(auth, accountId, profile.lastEarnedTrophyTimestamp);
            const editionTrophySuiteLinks = await fetchEditionTrophySuiteLinks(auth, accountId, playedGamesAndEditions.editions)
            const playedTrophySuites = await fetchTrophySuites(auth, accountId);
            const userTrophyData = await fetchTrophies(auth, accountId, playedTrophySuites, concurrency);

            playerList.push(player);
            playedGameList.push(...playedGamesAndEditions.games);
            playedEditionList.push(...playedGamesAndEditions.editions);
            playedTrophySuiteList.push(...playedTrophySuites);
            editionTrophySuiteLinkList.push(...editionTrophySuiteLinks);
            trophySuiteGroupList.push(...userTrophyData.groups);
            trophyList.push(...userTrophyData.trophies);
            earnedTrophyList.push(...userTrophyData.earnedTrophies);
        }

        // Insert data into database
        await insertIntoTrophyQuestDatabase(
            pool,
            playerList,
            playedGameList,
            playedEditionList,
            playedTrophySuiteList,
            editionTrophySuiteLinkList,
            trophySuiteGroupList,
            trophyList,
            earnedTrophyList
        )

        console.info("PSN Refresher : Success");
    } finally {
        const durationSeconds = (Date.now() - startTime) / 1000;
        console.info(`Total processing time: ${durationSeconds.toFixed(2)} s`);
        await pool.end();
    }
}

export const handler = async (
    _event: any = {},
    _context: any = {}
): Promise<void> => {
    await runRefresher();
};

if (!process.env.LAMBDA_TASK_ROOT) {
    runRefresher().catch((e) => {
        console.error(e);
        process.exitCode = 1;
    });
}