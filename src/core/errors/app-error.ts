import type { AppErrorPayload } from "./interfaces/app-error.interface";

export class AppError extends Error {
  readonly kind: AppErrorPayload["kind"];
  readonly statusCode?: number;
  readonly code?: string;
  readonly correlationId?: string;
  readonly details?: unknown;
  readonly cause?: unknown;

  constructor(payload: AppErrorPayload) {
    super(payload.message);
    this.name = "AppError";
    this.kind = payload.kind;
    this.statusCode = payload.statusCode;
    this.code = payload.code;
    this.correlationId = payload.correlationId;
    this.details = payload.details;
    this.cause = payload.cause;
  }
}
