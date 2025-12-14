import axios, { AxiosError } from "axios";
import { AppError } from "../errors/app-error";
import type { AppErrorKind } from "../errors/interfaces/app-error.interface";

export function mapHttpError(err: unknown, correlationId?: string): AppError {
  if (axios.isAxiosError(err)) {
    const ax = err as AxiosError<any>;
    const status = ax.response?.status;

    const kind: AppErrorKind =
      status === 401
        ? "Unauthorized"
        : status === 403
        ? "Forbidden"
        : status === 404
        ? "NotFound"
        : typeof status === "number"
        ? "Http"
        : ax.code === "ERR_NETWORK"
        ? "Network"
        : "Unknown";

    const message =
      ax.response?.data?.message || ax.message || "Unexpected error";

    return new AppError({
      kind,
      message,
      statusCode: status,
      correlationId,
      details: ax.response?.data,
      cause: err,
    });
  }

  if (err instanceof AppError) return err;

  const message = err instanceof Error ? err.message : "Unexpected error";
  return new AppError({ kind: "Unknown", message, correlationId, cause: err });
}
