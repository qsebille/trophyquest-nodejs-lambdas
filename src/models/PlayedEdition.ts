import {Edition} from "./Edition.js";

export interface PlayedEdition {
    edition: Edition,
    playerId: string,
    lastPlayedAt: string,
}