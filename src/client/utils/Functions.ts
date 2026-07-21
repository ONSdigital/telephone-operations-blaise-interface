function isDevEnv(): boolean {
  // Check for development environment via window object since this is client-side code
  return (window as Window & { __DEV__?: boolean }).__DEV__ === true || import.meta.env.DEV;
}

function isTrainingEnv(): boolean {
  return window.location.href.includes("training");
}

export { isDevEnv, isTrainingEnv };
