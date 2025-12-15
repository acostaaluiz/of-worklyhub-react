import { type PropsWithChildren, useCallback, useMemo, useState } from "react";

import { toAppError } from "@core/errors/to-app-error";
import type { AppError } from "@core/errors/app-error";
import type { AppErrorKind } from "@core/errors/interfaces/app-error.interface";
import { DEFAULT_ERROR_MESSAGES } from "@core/errors/error-messages";

import { ErrorModal } from "@shared/ui/components/error-modal/error-modal.component";
import type {
  ErrorModalModel,
  ErrorPresenter,
  ShowErrorOptions,
} from "./error.types";
import { ErrorContext } from "./error.context";

function severityByKind(kind: AppErrorKind) {
  if (kind === "Validation") return "warning" as const;
  if (kind === "Forbidden") return "warning" as const;
  if (kind === "NotFound") return "info" as const;
  return "error" as const;
}

const defaultPresenter: ErrorPresenter = (error) => {
  const ui =
    DEFAULT_ERROR_MESSAGES[error.kind] ?? DEFAULT_ERROR_MESSAGES.Unknown;
  return {
    ui,
    severity: severityByKind(error.kind),
    showDetails: Boolean(error.correlationId || error.statusCode || error.code),
  };
};

const initialModel: ErrorModalModel = {
  open: false,
  error: null,
  title: DEFAULT_ERROR_MESSAGES.Unknown.title,
  description: DEFAULT_ERROR_MESSAGES.Unknown.description,
  severity: "error",
  actionLabel: DEFAULT_ERROR_MESSAGES.Unknown.actionLabel ?? "Ok",
  canRetry: false,
  showDetails: false,
};

export function ErrorProvider({ children }: PropsWithChildren) {
  const [model, setModel] = useState<ErrorModalModel>(initialModel);
  const [onRetry, setOnRetry] = useState<(() => void) | null>(null);
  const [onClose, setOnClose] = useState<(() => void) | null>(null);

  const closeError = useCallback(() => {
    const cb = onClose;
    setOnClose(null);
    setOnRetry(null);
    setModel(initialModel);
    cb?.();
  }, [onClose]);

  const showAppError = useCallback(
    (error: AppError, options?: ShowErrorOptions) => {
      const presented = defaultPresenter(error);

      setOnRetry(options?.onRetry ?? null);
      setOnClose(options?.onClose ?? null);

      setModel({
        open: true,
        error,
        title: options?.title ?? presented.ui.title,
        description: options?.description ?? presented.ui.description,
        severity: options?.severity ?? presented.severity,
        actionLabel: options?.actionLabel ?? presented.ui.actionLabel ?? "Ok",
        canRetry: options?.canRetry ?? presented.ui.canRetry ?? false,
        showDetails: options?.showDetails ?? presented.showDetails,
      });
    },
    []
  );

  const showError = useCallback(
    (err: unknown, options?: ShowErrorOptions) => {
      const appError = toAppError(err);
      showAppError(appError, options);
    },
    [showAppError]
  );

  const value = useMemo(() => {
    return { showError, showAppError, closeError, model };
  }, [showError, showAppError, closeError, model]);

  const handlePrimary = useCallback(() => {
    if (model.canRetry && onRetry) {
      closeError();
      onRetry();
      return;
    }
    closeError();
  }, [model.canRetry, onRetry, closeError]);

  return (
    <ErrorContext.Provider value={value}>
      {children}

      <ErrorModal
        open={model.open}
        title={model.title}
        description={model.description}
        severity={model.severity}
        actionLabel={model.actionLabel}
        canRetry={model.canRetry}
        showDetails={model.showDetails}
        error={model.error}
        onClose={closeError}
        onPrimary={handlePrimary}
      />
    </ErrorContext.Provider>
  );
}
