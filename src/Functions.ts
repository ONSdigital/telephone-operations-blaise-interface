function isDevEnv(): boolean {
    return process.env.NODE_ENV === "development";
}

export {isDevEnv};