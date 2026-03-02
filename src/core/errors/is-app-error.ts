import { AppError } from "./app-error";

export function isAppError<TError>(err: TError): err is TError & AppError {
  return err instanceof AppError;
}
