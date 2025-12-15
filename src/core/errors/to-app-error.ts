import { AppError } from "./app-error";
import type { AppErrorPayload } from "./interfaces/app-error.interface";

function toMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "string" && err.trim()) return err;
  return fallback;
}

export function toAppError(
  err: unknown,
  payload?: Partial<Omit<AppErrorPayload, "message" | "kind">> & {
    kind?: AppErrorPayload["kind"];
    fallbackMessage?: string;
  }
): AppError {
  if (err instanceof AppError) return err;

  const fallbackMessage = payload?.fallbackMessage ?? "Unexpected error";
  const message = toMessage(err, fallbackMessage);

  return new AppError({
    kind: payload?.kind ?? "Unknown",
    message,
    statusCode: payload?.statusCode,
    code: payload?.code,
    correlationId: payload?.correlationId,
    details: payload?.details,
    cause: payload?.cause ?? err,
  });
}
