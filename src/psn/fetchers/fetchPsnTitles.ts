import {PsnAuthTokens} from "../../auth/psnAuthTokens.js";
import {PsnTitle} from "../models/psnTitle.js";
import {UserPlayedGamesResponse} from "psn-api";

const TITLE_SEARCH_LIMIT: number = 200;


export async function fetchPsnTitles(
    psnAuthTokens: PsnAuthTokens,
    accountId: string
): Promise<PsnTitle[]> {
    const {getUserPlayedGames} = await import("psn-api");

    let offset = 0;
    let result: PsnTitle[] = [];
    while (true) {
        const options = {limit: TITLE_SEARCH_LIMIT, offset}
        const userPlayedGamesResponse: UserPlayedGamesResponse = await getUserPlayedGames(psnAuthTokens, accountId, options);
        const psnTitles: PsnTitle[] = userPlayedGamesResponse.titles
            .filter(t => t.category === 'ps4_game' || t.category === 'ps5_native_game' || t.category === 'unknown')
            .map(title => {
                return {
                    id: title.titleId,
                    name: title.name,
                    imageUrl: title.imageUrl,
                    category: title.category,
                    lastPlayedDateTime: title.lastPlayedDateTime,
                }
            });
        result.push(...psnTitles);

        if (!userPlayedGamesResponse.nextOffset || userPlayedGamesResponse.nextOffset > userPlayedGamesResponse.totalItemCount) break;
        offset = userPlayedGamesResponse.nextOffset;
    }

    return result;
}