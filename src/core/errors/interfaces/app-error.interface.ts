export type AppErrorKind = "Network" | "Http" | "Validation" | "Unauthorized" | "Forbidden" | "NotFound" | "Unknown";

export interface AppErrorPayload {
  kind: AppErrorKind;
  message: string;
  statusCode?: number;
  code?: string;
  correlationId?: string;
  details?: unknown;
  cause?: unknown;
}
