// Expose the application version for display in the UI.
// Prefer runtime override via NEXT_PUBLIC_APP_VERSION (set at build time),
// otherwise fall back to package.json's version.
const pkg = ((): { version?: string } => {
  try {
    // relative import of package.json from src/libs -> ../../package.json
    // tsconfig should allow resolveJsonModule; fallback to empty object if import fails
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('../../package.json');
  } catch (e) {
    return {};
  }
})();

export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? pkg.version ?? '0.0.0';

export default APP_VERSION;
