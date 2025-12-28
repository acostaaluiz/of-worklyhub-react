import axios, { type AxiosInstance } from "axios";

import { mapHttpError } from "./http-error-mapper";
import type { Logger } from "../logger/interfaces/logger.interface";
import type { HttpClient, HttpRequestConfig, HttpResponse } from "./interfaces/http-client.interface";
import type { AuthProvider } from "../auth/interfaces/auth-provider.interface";
import { AppError } from "../errors/app-error";

function toQueryString(query?: Record<string, string | number | boolean | null | undefined>): string {
  if (!query) return "";
  const params = new URLSearchParams();

  Object.entries(query).forEach(([k, v]) => {
    if (v === null || v === undefined) return;
    params.set(k, String(v));
  });

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function ensureCorrelationId(existing?: string): string {
  if (existing) return existing;
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export interface AxiosHttpClientOptions {
  baseUrl: string;
  defaultTimeoutMs?: number;
  logger?: Logger;
  getAuthToken?: () => string | null;
  authProvider?: AuthProvider;
  retryOptions?: {
    retries?: number;
    retryOn?: (status?: number) => boolean;
  };
}

export class AxiosHttpClient implements HttpClient {
  private readonly axios: AxiosInstance;
  private readonly logger?: Logger;
  private readonly defaultTimeoutMs: number;
  private readonly getAuthToken?: () => string | null;
  private readonly authProvider?: AuthProvider;
  private readonly retryOptions?: NonNullable<AxiosHttpClientOptions["retryOptions"]>;

  constructor(options: AxiosHttpClientOptions) {
    this.logger = options.logger;
    this.defaultTimeoutMs = options.defaultTimeoutMs ?? 20000;
    this.getAuthToken = options.getAuthToken;
    this.authProvider = options.authProvider;
    this.retryOptions = options.retryOptions ?? { retries: 0 };

    this.axios = axios.create({
      baseURL: options.baseUrl,
      timeout: this.defaultTimeoutMs,
    });

    this.axios.interceptors.request.use((cfg) => {
      const correlationId = ensureCorrelationId((cfg.headers as any)?.["x-correlation-id"]);
      (cfg.headers as any) = { ...(cfg.headers as any), "x-correlation-id": correlationId };

      const token = this.authProvider?.getAccessToken?.() ?? this.getAuthToken?.();
      if (token) (cfg.headers as any) = { ...(cfg.headers as any), Authorization: `Bearer ${token}` };

      this.logger?.debug("HTTP request", {
        correlationId,
        method: cfg.method?.toUpperCase(),
        url: cfg.url,
      });

      return cfg;
    });

    this.axios.interceptors.response.use(
      (res) => {
        const correlationId = String((res.config.headers as any)?.["x-correlation-id"] || "");
        this.logger?.debug("HTTP response", {
          correlationId,
          status: res.status,
          url: res.config.url,
        });
        return res;
      },
      (err) => {
        const correlationId = String((err?.config?.headers as any)?.["x-correlation-id"] || "");
        const appError = mapHttpError(err, correlationId);

        this.logger?.error("HTTP error", {
          correlationId,
          kind: appError.kind,
          statusCode: appError.statusCode,
          message: appError.message,
        });

        return Promise.reject(appError);
      }
    );
  }

  async request<TData, TBody = unknown>(config: HttpRequestConfig<TBody>): Promise<HttpResponse<TData>> {
    const correlationId = ensureCorrelationId(config.correlationId);
    const url = `${config.url}${toQueryString(config.query)}`;
    const maxAttempts = (this.retryOptions?.retries ?? 0) + 1;
    let attempt = 0;
    let lastError: unknown = null;

    while (attempt < maxAttempts) {
      attempt += 1;
      try {
        const token = this.authProvider?.getAccessToken?.() ?? this.getAuthToken?.();
        const res = await this.axios.request<TData>({
          url,
          method: config.method,
          data: config.body,
          headers: { ...(config.headers ?? {}), "x-correlation-id": correlationId, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          signal: config.signal,
          timeout: config.timeoutMs ?? this.defaultTimeoutMs,
        });

        const headers: Record<string, string> = {};
        Object.entries(res.headers ?? {}).forEach(([k, v]) => {
          if (typeof v === "string") headers[k] = v;
        });

        return {
          data: res.data,
          status: res.status,
          headers,
          correlationId,
        };
      } catch (err) {
        lastError = err;

        // If unauthorized and authProvider can refresh, try refresh once
        if (err instanceof AppError && err.statusCode === 401 && this.authProvider?.refresh) {
          try {
            const newToken = await this.authProvider.refresh();
            if (newToken) {
              // token updated in provider; retry immediately
              continue;
            } else {
              this.authProvider.signOut?.();
              return Promise.reject(err);
            }
          } catch (_refreshErr) {
            this.authProvider.signOut?.();
            return Promise.reject(err);
          }
        }

        const status = err instanceof AppError ? err.statusCode : undefined;
        const isNetworkError = (err as any)?.code === "ERR_NETWORK" || (err as any)?.message?.includes?.("Network Error");

        const retryOn = this.retryOptions?.retryOn ?? ((s?: number) => (s ? s >= 500 || s === 429 : isNetworkError));

        const shouldRetry = attempt < maxAttempts && retryOn(status);
        if (shouldRetry) {
          const backoff = Math.pow(2, attempt) * 100;
          await new Promise((r) => setTimeout(r, backoff));
          continue;
        }

        return Promise.reject(err);
      }
    }

    return Promise.reject(lastError);
  }
}
