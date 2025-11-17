import {v5 as uuidv5} from "uuid";

function normalize(s: string) {
    return s
        .normalize("NFKD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
}

/** Namespaces */
const NS_USERS = "3c6f0e43-9a1f-4c9c-8a2a-0e6d6a2b7c55";
const NS_TITLES = "5f1d2b2d-5a5a-4d2d-8f2b-8b5f1a2c7e10";
const NS_TROPHY_SETS = "b79f0e2d-9b33-4a7e-9e4a-0d4e2a9b7c11";
const NS_TROPHIES = "d4dc082a-1db2-4571-9740-9f7e657628b7";

export function userUuid(accountId: string) {
    return uuidv5(normalize(accountId), NS_USERS);
}

export function titleUuid(titleId: string) {
    return uuidv5(normalize(titleId), NS_TITLES);
}

export function trophySetUuid(npCommunicationId: string) {
    return uuidv5(normalize(npCommunicationId), NS_TROPHY_SETS);
}

export function trophyUuid(npCommunicationId: string, rank: number) {
    return uuidv5(`${normalize(npCommunicationId)}-${rank}`, NS_TROPHIES);
}
