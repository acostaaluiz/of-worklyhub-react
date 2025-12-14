import type { Logger, LogLevel } from "./interfaces/logger.interface";

export class ConsoleLogger implements Logger {
  log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
    const payload = meta ? { message, ...meta } : { message };

    if (level === "debug") console.debug(payload);
    if (level === "info") console.info(payload);
    if (level === "warn") console.warn(payload);
    if (level === "error") console.error(payload);
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.log("debug", message, meta);
  }
  info(message: string, meta?: Record<string, unknown>): void {
    this.log("info", message, meta);
  }
  warn(message: string, meta?: Record<string, unknown>): void {
    this.log("warn", message, meta);
  }
  error(message: string, meta?: Record<string, unknown>): void {
    this.log("error", message, meta);
  }
}
