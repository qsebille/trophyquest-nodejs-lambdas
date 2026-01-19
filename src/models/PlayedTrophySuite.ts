import {TrophySuite} from "./TrophySuite.js";

export interface PlayedTrophySuite {
    trophySuite: TrophySuite,
    playerId: string,
    lastPlayedAt: string,
}