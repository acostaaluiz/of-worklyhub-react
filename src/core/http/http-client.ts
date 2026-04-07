import axios, { AxiosHeaders, type AxiosInstance } from "axios";

import { mapHttpError } from "./http-error-mapper";
import type { Logger } from "../logger/interfaces/logger.interface";
import type { HttpClient, HttpRequestConfig, HttpResponse } from "./interfaces/http-client.interface";
import type { AuthProvider } from "../auth/interfaces/auth-provider.interface";
import { AppError } from "../errors/app-error";
import { getCurrentAppLanguage } from "../i18n";

const IS_PRODUCTION =
  ((import.meta as { env?: Record<string, string | undefined> }).env?.MODE ?? "production") ===
  "production";

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

function toCanonicalQueryString(
  query?: Record<string, string | number | boolean | null | undefined>
): string {
  if (!query) return "";
  const pairs = Object.entries(query)
    .filter(([, value]) => value !== null && value !== undefined)
    .map(([key, value]) => [key, String(value)] as const)
    .sort(([keyA, valueA], [keyB, valueB]) => {
      if (keyA === keyB) return valueA.localeCompare(valueB);
      return keyA.localeCompare(keyB);
    });

  if (pairs.length <= 0) return "";

  const params = new URLSearchParams();
  pairs.forEach(([key, value]) => params.append(key, value));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function ensureCorrelationId(existing?: string): string {
  if (existing) return existing;
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toDataMap(value: object | null | undefined): DataMap | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as DataMap;
  }
  return null;
}

function toHeaderMap(value: object | null | undefined): Record<string, string> {
  const rawHeaders: Record<string, string | number | boolean> = {};
  if (value && typeof value === "object") {
    Object.entries(
      value as Record<string, string | number | boolean | null | undefined>
    ).forEach(([key, headerValue]) => {
      if (headerValue === null || headerValue === undefined) return;
      if (
        typeof headerValue === "string" ||
        typeof headerValue === "number" ||
        typeof headerValue === "boolean"
      ) {
        rawHeaders[key] = headerValue;
      }
    });
  }

  const source = AxiosHeaders.from(rawHeaders).toJSON() as Record<
    string,
    string | number | boolean | null | undefined
  >;
  const headers: Record<string, string> = {};
  Object.entries(source).forEach(([k, v]) => {
    if (typeof v === "string") headers[k] = v;
    if (typeof v === "number" || typeof v === "boolean") headers[k] = String(v);
  });

  return headers;
}

function getErrorCorrelationId(error: object | null | undefined): string {
  const map = toDataMap(error);
  const configValue = map?.config;
  const config =
    configValue && typeof configValue === "object" && !Array.isArray(configValue)
      ? toDataMap(configValue)
      : null;
  const headersValue = config?.headers;
  const headers =
    headersValue && typeof headersValue === "object" && !Array.isArray(headersValue)
      ? toHeaderMap(headersValue)
      : {};
  return String(headers["x-correlation-id"] || "");
}

function isNetworkLikeError(error: object | null | undefined): boolean {
  const map = toDataMap(error);
  const code = typeof map?.code === "string" ? map.code : "";
  const message = typeof map?.message === "string" ? map.message : "";
  return (
    code === "ERR_NETWORK" ||
    message.includes("Network Error")
  );
}

function resolveRequestLanguage(headers: Record<string, string>): string {
  const lowered: Record<string, string> = {};
  Object.entries(headers).forEach(([key, value]) => {
    lowered[key.toLowerCase()] = value;
  });

  const fromHeader = lowered["x-language"] || lowered["accept-language"];
  return (fromHeader && fromHeader.trim().length > 0)
    ? fromHeader.trim()
    : getCurrentAppLanguage();
}

function toCanonicalHeadersKey(headers?: Record<string, string>): string {
  if (!headers) return "";

  const entries = Object.entries(headers)
    .map(([key, value]) => [key.toLowerCase(), String(value)] as const)
    .filter(([key]) => key !== "x-correlation-id")
    .sort(([keyA, valueA], [keyB, valueB]) => {
      if (keyA === keyB) return valueA.localeCompare(valueB);
      return keyA.localeCompare(keyB);
    });

  if (entries.length <= 0) return "";
  return entries.map(([key, value]) => `${key}:${value}`).join("|");
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
  private readonly inFlightGetRequests = new Map<string, Promise<HttpResponse<unknown>>>();
  private readonly recentGetResponses = new Map<
    string,
    { timestamp: number; response: HttpResponse<unknown> }
  >();
  private readonly getDedupeTtlMs = 1000;

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
      const headerMap = toHeaderMap(cfg.headers ?? null);
      const correlationId = ensureCorrelationId(headerMap["x-correlation-id"]);
      const language = resolveRequestLanguage(headerMap);

      const token = this.authProvider?.getAccessToken?.() ?? this.getAuthToken?.();
      cfg.headers = AxiosHeaders.from({
        ...headerMap,
        "x-correlation-id": correlationId,
        "x-language": language,
        "Accept-Language": language,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      });

      if (!IS_PRODUCTION) {
        this.logger?.debug("HTTP request", {
          correlationId,
          method: cfg.method?.toUpperCase(),
          url: cfg.url,
        });
      }

      return cfg;
    });

    this.axios.interceptors.response.use(
      (res) => {
        const correlationId = String(
          toHeaderMap(res.config.headers ?? null)["x-correlation-id"] || ""
        );
        if (!IS_PRODUCTION) {
          this.logger?.debug("HTTP response", {
            correlationId,
            status: res.status,
            url: res.config.url,
          });
        }
        return res;
      },
      (err) => {
        const correlationId =
          err && typeof err === "object" ? getErrorCorrelationId(err) : "";
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

  private buildGetDedupeKey<TBody = DataValue>(
    config: HttpRequestConfig<TBody>
  ): string | null {
    if (config.method !== "GET") return null;
    if (config.signal) return null;
    if (config.body !== undefined && config.body !== null) return null;

    const query = toCanonicalQueryString(config.query);
    const headers = toCanonicalHeadersKey(config.headers);
    const language = getCurrentAppLanguage();
    const token = this.authProvider?.getAccessToken?.() ?? this.getAuthToken?.() ?? "";

    return [
      "GET",
      config.url,
      query,
      headers,
      language,
      token,
    ].join("::");
  }

  private getRecentGetResponse(key: string): HttpResponse<unknown> | null {
    const cached = this.recentGetResponses.get(key);
    if (!cached) return null;
    if (Date.now() - cached.timestamp > this.getDedupeTtlMs) {
      this.recentGetResponses.delete(key);
      return null;
    }
    return cached.response;
  }

  private setRecentGetResponse(key: string, response: HttpResponse<unknown>): void {
    this.recentGetResponses.set(key, { timestamp: Date.now(), response });
  }

  private evictStaleRecentGetResponses(): void {
    const now = Date.now();
    this.recentGetResponses.forEach((value, key) => {
      if (now - value.timestamp > this.getDedupeTtlMs) {
        this.recentGetResponses.delete(key);
      }
    });
  }

  async request<TData, TBody = DataValue>(
    config: HttpRequestConfig<TBody>
  ): Promise<HttpResponse<TData>> {
    const dedupeKey = this.buildGetDedupeKey(config);
    if (dedupeKey) {
      this.evictStaleRecentGetResponses();

      const recent = this.getRecentGetResponse(dedupeKey);
      if (recent) {
        return recent as HttpResponse<TData>;
      }

      const inFlight = this.inFlightGetRequests.get(dedupeKey);
      if (inFlight) {
        return inFlight as Promise<HttpResponse<TData>>;
      }
    }

    const executeRequest = async (): Promise<HttpResponse<TData>> => {
      const correlationId = ensureCorrelationId(config.correlationId);
      const url = `${config.url}${toQueryString(config.query)}`;
      const maxAttempts = (this.retryOptions?.retries ?? 0) + 1;
      let attempt = 0;
      let lastError: Error | null = null;

      while (attempt < maxAttempts) {
        attempt += 1;
        try {
          const token = this.authProvider?.getAccessToken?.() ?? this.getAuthToken?.();

          if (!IS_PRODUCTION) {
            this.logger?.debug?.("HTTP sending", { correlationId, url, method: config.method, token: !!token });
          }

          const res = await this.axios.request<TData>({
            url,
            method: config.method,
            data: config.body,
            headers: {
              ...(config.headers ?? {}),
              "x-correlation-id": correlationId,
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
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
          const caughtError =
            err instanceof Error ? err : new Error(String(err));
          lastError = caughtError;

          if (caughtError instanceof AppError && caughtError.statusCode === 401 && this.authProvider?.refresh) {
            try {
              const newToken = await this.authProvider.refresh();
              if (newToken) {
                continue;
              }
              this.authProvider.signOut?.();
              return Promise.reject(caughtError);
            } catch (_refreshErr) {
              this.authProvider.signOut?.();
              return Promise.reject(caughtError);
            }
          }

          const status =
            caughtError instanceof AppError ? caughtError.statusCode : undefined;
          const isNetworkError = isNetworkLikeError(caughtError);

          const retryOn =
            this.retryOptions?.retryOn ??
            ((s?: number) => (s ? s >= 500 || s === 429 : isNetworkError));

          const shouldRetry = attempt < maxAttempts && retryOn(status);
          if (shouldRetry) {
            const backoff = Math.pow(2, attempt) * 100;
            await new Promise((r) => setTimeout(r, backoff));
            continue;
          }

          return Promise.reject(caughtError);
        }
      }

      return Promise.reject(lastError ?? new Error("HTTP request failed"));
    };

    if (!dedupeKey) {
      return executeRequest();
    }

    const requestPromise = executeRequest()
      .then((response) => {
        this.setRecentGetResponse(dedupeKey, response as HttpResponse<unknown>);
        return response;
      })
      .finally(() => {
        this.inFlightGetRequests.delete(dedupeKey);
      });

    this.inFlightGetRequests.set(
      dedupeKey,
      requestPromise as Promise<HttpResponse<unknown>>
    );

    return requestPromise;
  }
}
