import {GameCollectionStaging} from "./staging/gameCollectionStaging.js";

export interface AppTrophyCollection {
    id: string;
    game_id: string;
    title: string;
    platform: string;
    image_url: string;
}

export function buildAppTrophyCollections(staging: GameCollectionStaging[]): AppTrophyCollection[] {
    return staging.map(trophyCollection => ({
        id: trophyCollection.trophyCollectionAppUuid,
        game_id: trophyCollection.gameAppUuid,
        title: trophyCollection.trophyCollectionName,
        platform: trophyCollection.trophyCollectionPlatform,
        image_url: trophyCollection.trophyCollectionImageUrl
    }));
}