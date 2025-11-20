export type Params = {
    npsso: string;
    profileName: string | undefined;
    postgresHost: string;
    postgresPort: number;
    postgresDatabase: string;
    postgresUser: string;
    postgresPassword: string;
    postgresSsl: string | undefined;
}


export function getParams(): Params {
    const NPSSO: string | undefined = process.env.NPSSO;
    const PROFILE_NAME: string | undefined = process.env.PROFILE_NAME;
    const PGHOST: string | undefined = process.env.PGHOST;
    const PGPORT: string | undefined = process.env.PGPORT;
    const PGDATABASE: string | undefined = process.env.PGDATABASE;
    const PGUSER: string | undefined = process.env.PGUSER;
    const PGPASSWORD: string | undefined = process.env.PGPASSWORD;
    const PGSSL: string | undefined = process.env.PGSSL;

    if (NPSSO === undefined) {
        console.error("NPSSO params must be provided")
        process.exit(1);
    }
    if (PGHOST === undefined) {
        console.error("PGHOST params must be provided")
        process.exit(1);
    }
    if (PGPORT === undefined) {
        console.error("PGPORT params must be provided")
        process.exit(1);
    }
    if (PGDATABASE === undefined) {
        console.error("PGDATABASE params must be provided")
        process.exit(1);
    }
    if (PGUSER === undefined) {
        console.error("PGUSER params must be provided")
        process.exit(1);
    }
    if (PGPASSWORD === undefined) {
        console.error("PGPASSWORD params must be provided")
        process.exit(1);
    }

    return {
        npsso: NPSSO,
        profileName: PROFILE_NAME,
        postgresHost: PGHOST,
        postgresPort: Number(PGPORT),
        postgresDatabase: PGDATABASE,
        postgresUser: PGUSER,
        postgresPassword: PGPASSWORD,
        postgresSsl: PGSSL,
    }
}