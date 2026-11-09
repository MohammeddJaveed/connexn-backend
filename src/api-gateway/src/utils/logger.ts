import pino from 'pino';

const LOG_LEVELS = { debug: 10, info: 20, warn: 30, error: 40 } as const;
type LogLevel = keyof typeof LOG_LEVELS;

function isLogLevel(value: string): value is LogLevel {
  return Object.prototype.hasOwnProperty.call(LOG_LEVELS, value);
}

const configuredLevel = process.env.LOG_LEVEL;
const logLevel: LogLevel =
  configuredLevel && isLogLevel(configuredLevel) ? configuredLevel : 'info';

export const logger = pino({
  customLevels: LOG_LEVELS,
  useOnlyCustomLevels: true,
  level: logLevel,
  formatters: {
    level(label) {
      return { level: label };
    },
  },
});
