import { AppError } from "./app-error";

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}
