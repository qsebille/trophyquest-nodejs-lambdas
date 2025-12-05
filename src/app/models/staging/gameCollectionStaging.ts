import {PsnTitle} from "../../../psn/models/psnTitle.js";
import {PsnTrophySet} from "../../../psn/models/psnTrophySet.js";
import {PsnTitleTrophySet} from "../../../psn/models/psnTitleTrophySet.js";
import {computeGameUuid, computeTrophyCollectionUuid} from "../../utils/uuid.js";


export interface GameCollectionStaging {
    gameAppUuid: string;
    gameName: string;
    gameImageUrl: string;
    psnTitleId: string;
    psnTrophySetId: string;
    trophyCollectionAppUuid: string;
    trophyCollectionName: string;
    trophyCollectionPlatform: string;
    trophyCollectionImageUrl: string;
}

export function buildGameCollectionStaging(
    psnTitles: PsnTitle[],
    psnTrophySets: PsnTrophySet[],
    psnTitlesTrophySets: PsnTitleTrophySet[]
): GameCollectionStaging[] {
    const titleById = new Map<string, PsnTitle>(psnTitles.map(t => [t.id, t]));
    const trophySetById = new Map<string, PsnTrophySet>(psnTrophySets.map(ts => [ts.id, ts]));

    const collectionStaging: GameCollectionStaging[] = [];
    for (const link of psnTitlesTrophySets) {
        const psnTitle = titleById.get(link.titleId);
        const psnTrophySet = trophySetById.get(link.trophySetId);

        if (!psnTitle || !psnTrophySet) {
            continue;
        }

        const gameAppUuid: string = computeGameUuid(psnTitle);
        const trophyCollectionAppUuid: string = computeTrophyCollectionUuid(gameAppUuid, psnTrophySet.id);

        collectionStaging.push({
            gameAppUuid,
            gameName: psnTitle.name,
            gameImageUrl: psnTitle.imageUrl,
            psnTitleId: psnTitle.id,
            psnTrophySetId: psnTrophySet.id,
            trophyCollectionAppUuid,
            trophyCollectionName: psnTrophySet.name,
            trophyCollectionPlatform: psnTrophySet.platform,
            trophyCollectionImageUrl: psnTrophySet.iconUrl,
        });
    }

    return collectionStaging;
}