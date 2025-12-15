import type { AppError } from "@core/errors/app-error";
import type { ErrorMessageConfig } from "@core/errors/error-messages";

export type ErrorSeverity = "info" | "warning" | "error";

export type ErrorModalModel = {
  open: boolean;
  error: AppError | null;
  title: string;
  description: string;
  severity: ErrorSeverity;
  actionLabel: string;
  canRetry: boolean;
  showDetails: boolean;
};

export type ShowErrorOptions = {
  title?: string;
  description?: string;
  severity?: ErrorSeverity;
  actionLabel?: string;
  canRetry?: boolean;
  showDetails?: boolean;
  onRetry?: () => void;
  onClose?: () => void;
};

export type ErrorPresenter = (error: AppError) => {
  ui: ErrorMessageConfig;
  severity: ErrorSeverity;
  showDetails: boolean;
};

export type ErrorContextValue = {
  showError: (error: unknown, options?: ShowErrorOptions) => void;
  showAppError: (error: AppError, options?: ShowErrorOptions) => void;
  closeError: () => void;
  model: ErrorModalModel;
};
