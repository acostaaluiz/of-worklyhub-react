import type { AppErrorKind } from "./interfaces/app-error.interface";

export type ErrorMessageConfig = {
  title: string;
  description: string;
  actionLabel?: string;
  canRetry?: boolean;
};

export const DEFAULT_ERROR_MESSAGES: Record<AppErrorKind, ErrorMessageConfig> =
  {
    Network: {
      title: "Network error",
      description:
        "We could not reach the server. Check your connection and try again.",
      actionLabel: "Try again",
      canRetry: true,
    },
    Http: {
      title: "Request failed",
      description:
        "Something went wrong while processing your request. Please try again.",
      actionLabel: "Try again",
      canRetry: true,
    },
    Validation: {
      title: "Invalid data",
      description:
        "Some information is missing or invalid. Review the fields and try again.",
      actionLabel: "Ok",
      canRetry: false,
    },
    Unauthorized: {
      title: "Session expired",
      description: "Please sign in again to continue.",
      actionLabel: "Ok",
      canRetry: false,
    },
    Forbidden: {
      title: "Access denied",
      description: "You don't have permission to perform this action.",
      actionLabel: "Ok",
      canRetry: false,
    },
    NotFound: {
      title: "Not found",
      description: "The requested resource could not be found.",
      actionLabel: "Ok",
      canRetry: false,
    },
    Unknown: {
      title: "Unexpected error",
      description:
        "An unexpected error occurred. If the problem persists, contact support.",
      actionLabel: "Ok",
      canRetry: false,
    },
  };
