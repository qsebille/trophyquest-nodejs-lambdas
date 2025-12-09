export function getNpsso(): string {
    if (process.env.NPSSO === undefined) {
        console.error("NPSSO params must be provided")
        process.exit(1);
    } else {
        return process.env.NPSSO;
    }
}