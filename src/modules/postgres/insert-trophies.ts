import {Params} from "../utils/params.js";
import {buildInsertPlaceholders, postgresUtils} from "./postgres-utils.js";
import {EarnedTrophyDTO, TrophyDTO} from "../psn-trophy.js";

const TROPHY_BATCH_SIZE: number = 200;

export async function insertTrophiesIntoPostgres(trophies: TrophyDTO[], params: Params): Promise<any> {
    const pool = postgresUtils(params);
    let nbIgnored: number = 0;
    let nbInserted: number = 0;

    for (let i = 0; i < trophies.length; i += TROPHY_BATCH_SIZE) {
        const batch = trophies.slice(i, i + TROPHY_BATCH_SIZE);
        const values: string[] = [];
        const placeholders: string = batch.map((trophy, idx) => {
            const currentValues: string[] = [
                trophy.id,
                trophy.rank.toString(),
                trophy.name,
                trophy.description,
                trophy.trophySetId,
                trophy.isHidden.toString(),
                trophy.trophyType,
                trophy.iconUrl,
                trophy.groupId,
            ];
            values.push(...currentValues);
            return buildInsertPlaceholders(currentValues, idx);
        }).join(',');

        const insert = await pool.query(`
            INSERT INTO public.psn_trophy (id, rank, name, description, trophy_set_id, is_hidden, trophy_type, icon_url,
                                          game_group_id)
            VALUES ${placeholders} ON CONFLICT (id) DO NOTHING
        `, values);

        nbInserted += insert.rowCount ?? 0;
        nbIgnored += (batch.length - (insert.rowCount ?? 0));
    }

    console.info(`Inserted ${nbInserted} trophies into postgres database ${nbIgnored > 0 ? `(${nbIgnored} ignored)` : ''}`);
}

export async function insertEarnedTrophiesIntoPostgres(earnedTrophies: EarnedTrophyDTO[], params: Params): Promise<any> {
    const pool = postgresUtils(params);
    let nbIgnored: number = 0;
    let nbInserted: number = 0;

    for (let i = 0; i < earnedTrophies.length; i += TROPHY_BATCH_SIZE) {
        const batch = earnedTrophies.slice(i, i + TROPHY_BATCH_SIZE);
        const values: string[] = [];
        const placeholders: string = batch.map((trophy, idx) => {
            const currentValues: string[] = [
                trophy.trophyId,
                trophy.userId,
                trophy.earnedDateTime,
            ];
            values.push(...currentValues);
            return buildInsertPlaceholders(currentValues, idx);
        }).join(',');

        const insert = await pool.query(`
            INSERT INTO public.psn_earned_trophy (trophy_id, user_id, earned_timestamp)
            VALUES ${placeholders} ON CONFLICT (trophy_id,user_id) DO NOTHING
        `, values);

        nbInserted += insert.rowCount ?? 0;
        nbIgnored += (batch.length - (insert.rowCount ?? 0));
    }

    console.info(`Inserted ${nbInserted} earned trophies into postgres database ${nbIgnored > 0 ? `(${nbIgnored} ignored)` : ''}`);
}