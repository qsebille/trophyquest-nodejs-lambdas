export function getProfileName(): string {
    if (process.env.PROFILE_NAME === undefined) {
        console.error("PROFILE_NAME params must be provided")
        process.exit(1);
    } else {
        return process.env.PROFILE_NAME;
    }
}