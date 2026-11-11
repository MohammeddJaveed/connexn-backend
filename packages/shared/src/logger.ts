import pino from 'pino';

export const LOG_LEVELS = { debug: 10, info: 20, warn: 30, error: 40 } as const;
export type LogLevel = keyof typeof LOG_LEVELS;

function isLogLevel(value: string): value is LogLevel {
  return Object.prototype.hasOwnProperty.call(LOG_LEVELS, value);
}

export function createLogger(service: string) {
  const configuredLevel = process.env.LOG_LEVEL;
  const level: LogLevel = configuredLevel && isLogLevel(configuredLevel)
    ? configuredLevel
    : 'info';

  return pino({
    base: { service },
    customLevels: LOG_LEVELS,
    useOnlyCustomLevels: true,
    level,
    formatters: {
      level(label) {
        return { level: label };
      },
    },
  });
}

export type ServiceLogger = ReturnType<typeof createLogger>;
