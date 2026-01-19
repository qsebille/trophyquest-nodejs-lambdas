import {Game} from "./Game.js";

export interface PlayedGame {
    game: Game,
    playerId: string,
    firstPlayedAt: string,
    lastPlayedAt: string,
}