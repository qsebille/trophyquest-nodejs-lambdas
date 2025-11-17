import {AuthData} from "./auth.js";
import {titleUuid, trophySetUuid} from "./utils/uuid.js";

export type TitleDTO = {
    id: string;
    psnId: string;
    name: string;
    imageUrl: string;
    category: string;
    lastPlayedDateTime: string;
}

export type TrophySetDTO = {
    id: string;
    psnId: string;
    serviceName: string;
    name: string;
    iconUrl: string;
    version: string;
    platform: string;
}

export type TitleTrophySetDTO = {
    titleId: string;
    trophySetId: string;
}

export type PsnTitlesTrophySetResponseDTO = {
    titles: TitleDTO[];
    trophySets: TrophySetDTO[];
    links: TitleTrophySetDTO[];
}

async function fetchPsnTitles(authData: AuthData): Promise<TitleDTO[]> {
    // @ts-ignore
    const {getUserPlayedGames} = await import("psn-api");

    const limit = 200; // Maximum limit for Sony API.
    let offset = 0;
    let result: TitleDTO[] = [];
    while (true) {
        const userPlayedGamesResponse = await getUserPlayedGames(authData.tokens, authData.accountId, {limit, offset});
        const pagePsnTitles: TitleDTO[] = userPlayedGamesResponse.titles
            // @ts-ignore
            .filter(t => t.category === 'ps4_game' || t.category === 'ps5_native_game' || t.category === 'unknown')
            // @ts-ignore
            .map(title => {
                return {
                    id: titleUuid(title.titleId),
                    psnId: title.titleId,
                    name: title.name,
                    imageUrl: title.imageUrl,
                    category: title.category,
                    lastPlayedDateTime: title.lastPlayedDateTime,
                }
            });
        result.push(...pagePsnTitles);

        if (!userPlayedGamesResponse.nextOffset || userPlayedGamesResponse.nextOffset > userPlayedGamesResponse.totalItemCount) break;
        offset = userPlayedGamesResponse.nextOffset;
    }

    return result;
}

function normalizePlatform(psnPlatform: string): string {
    const allPlatforms: string[] = psnPlatform.split(",");
    if (allPlatforms.filter(p => p === "PS5").length === 1) {
        return "PS5";
    } else if (allPlatforms.filter(p => p === "PS4").length === 1) {
        return "PS4";
    } else if (allPlatforms.filter(p => p === "PS3").length === 1) {
        return "PS3"
    } else {
        return psnPlatform;
    }
}

async function fetchUserTitles(authData: AuthData): Promise<TrophySetDTO[]> {
    const limit = 200;
    let offset = 0;
    const result: TrophySetDTO[] = [];
    // @ts-ignore
    const {getUserTitles} = await import("psn-api");
    while (true) {
        const userTitlesResponse = await getUserTitles(authData.tokens, authData.accountId, {limit, offset});
        // @ts-ignore
        const pageUserTitles = userTitlesResponse.trophyTitles.map(trophyTitle => {
            return {
                id: trophySetUuid(trophyTitle.npCommunicationId),
                psnId: trophyTitle.npCommunicationId,
                serviceName: trophyTitle.npServiceName,
                name: trophyTitle.trophyTitleName,
                iconUrl: trophyTitle.trophyTitleIconUrl,
                version: trophyTitle.trophySetVersion,
                platform: normalizePlatform(trophyTitle.trophyTitlePlatform),
            }
        });
        result.push(...pageUserTitles);
        if (!userTitlesResponse.nextOffset) break;
        offset = userTitlesResponse.nextOffset;
    }

    return result;
}

export async function getTitlesData(authData: AuthData): Promise<PsnTitlesTrophySetResponseDTO> {
    console.info("Fetching titles and trophy sets data...");
    // @ts-ignore
    const {getUserTrophiesForSpecificTitle} = await import("psn-api");
    const chunkBy = <T>(arr: T[], size: number) =>
        Array.from({length: Math.ceil(arr.length / size)}, (_, i) => arr.slice(i * size, (i + 1) * size));

    const psnTitles: TitleDTO[] = await fetchPsnTitles(authData);
    const trophySets: TrophySetDTO[] = await fetchUserTitles(authData);
    const trophySetIds: string[] = trophySets.map(t => t.psnId);

    let joinList: TitleTrophySetDTO[] = [];
    const NP_TITLE_CHUNK_SIZE = 5;
    for (const chunk of chunkBy(psnTitles, NP_TITLE_CHUNK_SIZE)) {
        const options = {npTitleIds: chunk.map(t => t.psnId).join(",")}
        const trophySetResponse = await getUserTrophiesForSpecificTitle(authData.tokens, authData.accountId, options);

        for (const title of trophySetResponse.titles) {
            for (const trophyTitle of title.trophyTitles) {
                if (trophySetIds.includes(trophyTitle.npCommunicationId)) {
                    joinList.push({
                        titleId: titleUuid(title.npTitleId),
                        trophySetId: trophySetUuid(trophyTitle.npCommunicationId),
                    });
                }
            }
        }
    }

    console.info("Successfully fetched titles and trophy sets data");
    return {
        titles: psnTitles,
        trophySets: trophySets,
        links: joinList,
    };
}