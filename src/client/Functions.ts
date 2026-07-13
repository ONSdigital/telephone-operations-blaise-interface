function isDevEnv(): boolean {
    return process.env.NODE_ENV === "development";
}

function isTrainingEnv(): boolean {
    return window.location.href.includes("training");
}

export {isDevEnv, isTrainingEnv};
