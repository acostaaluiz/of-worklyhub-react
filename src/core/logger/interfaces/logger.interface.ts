export type LogLevel = "debug" | "info" | "warn" | "error";

export interface Logger {
  log(level: LogLevel, message: string, meta?: Record<string, DataValue>): void;
  debug(message: string, meta?: Record<string, DataValue>): void;
  info(message: string, meta?: Record<string, DataValue>): void;
  warn(message: string, meta?: Record<string, DataValue>): void;
  error(message: string, meta?: Record<string, DataValue>): void;
}
