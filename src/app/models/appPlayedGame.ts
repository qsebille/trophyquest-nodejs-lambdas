import {PsnPlayedTitle} from "../../psn/models/psnPlayedTitle.js";
import {UserStaging} from "./staging/userStaging.js";
import {GameCollectionStaging} from "./staging/gameCollectionStaging.js";

export interface AppPlayedGame {
    player_id: string,
    game_id: string,
    last_played_at: string
}

export function buildAppPlayedGames(
    psnUserPlayedTitles: PsnPlayedTitle[],
    userStaging: UserStaging[],
    gameCollectionStaging: GameCollectionStaging[],
): AppPlayedGame[] {
    const userStagingById = new Map<string, UserStaging>(userStaging.map(u => [u.userPsnId, u]));
    const gameTrophyCollectionStagingByPsnTitleId = new Map<string, GameCollectionStaging>(gameCollectionStaging.map(c => [c.psnTitleId, c]));

    const appUserGames: AppPlayedGame[] = [];
    const ids = new Set<String>();
    for (const playedTitle of psnUserPlayedTitles) {
        const userStaging = userStagingById.get(playedTitle.userId);
        const gameTrophyCollectionStaging = gameTrophyCollectionStagingByPsnTitleId.get(playedTitle.titleId);
        if (!userStaging || !gameTrophyCollectionStaging) {
            continue;
        }

        const id = `${userStaging.userAppId}-${gameTrophyCollectionStaging.gameAppUuid}`;
        if (!ids.has(id)) {
            appUserGames.push({
                player_id: userStaging.userAppId,
                game_id: gameTrophyCollectionStaging.gameAppUuid,
                last_played_at: playedTitle.lastPlayedDateTime
            });
            ids.add(id);
        }
    }

    return appUserGames;
}