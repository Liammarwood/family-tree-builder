/**
 * Simple centralized logger that only forwards messages to console in development.
 * Use logger.debug/info/warn/error from application code. In production these are no-ops
 * except error which still logs to console.error.
 */
const isDev = process.env.NODE_ENV !== "production";

export const logger = {
  debug: (...args: any[]) => {
    if (isDev) console.debug(...args);
  },
  info: (...args: any[]) => {
    if (isDev) console.info(...args);
  },
  warn: (...args: any[]) => {
    if (isDev) console.warn(...args);
  },
  error: (...args: any[]) => {
    // Always log errors to console to help production diagnostics
    console.error(...args);
  },
};

export default logger;
