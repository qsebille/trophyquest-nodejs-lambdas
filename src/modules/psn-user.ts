import {userUuid} from "./utils/uuid.js";
import {AuthData} from "./auth.js";

export type UserTQ = {
    psnId: string;
    id: string;
    profileName: string;
    avatarUrl: string | null;
}

export async function getUserInfo(auth: AuthData, profileName: string): Promise<UserTQ> {
    // @ts-ignore
    const {getProfileFromUserName} = await import("psn-api");
    const userPsn = await getProfileFromUserName(auth, profileName);
    return {
        psnId: userPsn.profile.accountId,
        id: userUuid(userPsn.profile.accountId),
        profileName: userPsn.profile.onlineId,
        avatarUrl: userPsn.profile.avatarUrls[0]?.avatarUrl ?? null,
    };
}