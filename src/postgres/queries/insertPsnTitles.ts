import {Pool} from "pg";
import {buildPostgresInsertPlaceholders} from "../utils/buildPostgresInsertPlaceholders.js";
import {PsnTitle} from "../../psn/models/psnTitle.js";
import {InsertQueryResult} from "../models/insertQueryResult.js";


/**
 * Inserts a list of PSN titles into the PostgreSQL database.
 * Titles with conflicting IDs will be ignored.
 *
 * @param {Pool} pool - The database connection pool to use for executing the query.
 * @param {PsnTitle[]} titles - An array of PSN title objects to be inserted into the database.
 * Each title must contain fields for id, name, category, and imageUrl.
 * @return {Promise<InsertQueryResult>} A promise that resolves to an object containing the number
 * of rows inserted and the number of rows ignored (due to conflicts).
 */
export async function insertPsnTitles(
    pool: Pool,
    titles: PsnTitle[]
): Promise<InsertQueryResult> {
    if (titles.length === 0) {
        console.info("No titles to insert into postgres database.");
        return {rowsInserted: 0, rowsIgnored: 0};
    }

    const values: string[] = [];
    const placeholders: string = titles.map((
        t,
        idx
    ) => {
        const currentValues = [t.id, t.name, t.category, t.imageUrl];
        values.push(...currentValues);
        return buildPostgresInsertPlaceholders(currentValues, idx);
    }).join(',');

    const insert = await pool.query(`
        INSERT INTO psn.title (id, name, category, image_url)
        VALUES
            ${placeholders} ON CONFLICT (id)
        DO NOTHING
    `, values);

    const nbInserted = insert.rowCount ?? 0;
    const nbIgnored = titles.length - nbInserted;
    return {
        rowsInserted: nbInserted,
        rowsIgnored: nbIgnored,
    }
}