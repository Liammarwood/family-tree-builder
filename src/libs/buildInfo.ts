// Expose build metadata provided at build time via NEXT_PUBLIC_* env vars.
export const COMMIT_SHA = process.env.NEXT_PUBLIC_COMMIT_SHA ?? '';
export const BUILD_TIME = process.env.NEXT_PUBLIC_BUILD_TIME ?? '';
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? '';

const buildInfo = {
  commit: COMMIT_SHA,
  buildTime: BUILD_TIME,
  version: APP_VERSION,
};

export default buildInfo;
