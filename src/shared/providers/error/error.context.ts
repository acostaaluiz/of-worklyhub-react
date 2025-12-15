import { createContext } from "react";
import type { ErrorContextValue } from "./error.types";

export const ErrorContext = createContext<ErrorContextValue | null>(null);