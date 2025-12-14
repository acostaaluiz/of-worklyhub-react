import type { BaseHttpServiceOptions } from "./interfaces/base-http.interface";
import type { HttpClient } from "./interfaces/http-client.interface";

function withNamespaceCorrelationId(namespace?: string): string | undefined {
  if (!namespace) return undefined;
  if (typeof crypto !== "undefined" && "randomUUID" in crypto)
    return `${namespace}:${crypto.randomUUID()}`;
  return `${namespace}:${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export abstract class BaseHttpService {
  protected readonly http: HttpClient;
  protected readonly options: BaseHttpServiceOptions;

  constructor(http: HttpClient, options?: BaseHttpServiceOptions) {
    this.http = http;
    this.options = options ?? {};
  }

  protected async get<TResponse>(
    url: string,
    query?: Record<string, any>,
    headers?: Record<string, string>
  ): Promise<TResponse> {
    const res = await this.http.request<TResponse>({
      url,
      method: "GET",
      query,
      headers,
      correlationId: withNamespaceCorrelationId(
        this.options.correlationNamespace
      ),
    });
    return res.data;
  }

  protected async post<TResponse, TBody = unknown>(
    url: string,
    body?: TBody,
    headers?: Record<string, string>
  ): Promise<TResponse> {
    const res = await this.http.request<TResponse, TBody>({
      url,
      method: "POST",
      body,
      headers,
      correlationId: withNamespaceCorrelationId(
        this.options.correlationNamespace
      ),
    });
    return res.data;
  }

  protected async put<TResponse, TBody = unknown>(
    url: string,
    body?: TBody,
    headers?: Record<string, string>
  ): Promise<TResponse> {
    const res = await this.http.request<TResponse, TBody>({
      url,
      method: "PUT",
      body,
      headers,
      correlationId: withNamespaceCorrelationId(
        this.options.correlationNamespace
      ),
    });
    return res.data;
  }

  protected async patch<TResponse, TBody = unknown>(
    url: string,
    body?: TBody,
    headers?: Record<string, string>
  ): Promise<TResponse> {
    const res = await this.http.request<TResponse, TBody>({
      url,
      method: "PATCH",
      body,
      headers,
      correlationId: withNamespaceCorrelationId(
        this.options.correlationNamespace
      ),
    });
    return res.data;
  }

  protected async delete<TResponse>(
    url: string,
    query?: Record<string, any>,
    headers?: Record<string, string>
  ): Promise<TResponse> {
    const res = await this.http.request<TResponse>({
      url,
      method: "DELETE",
      query,
      headers,
      correlationId: withNamespaceCorrelationId(
        this.options.correlationNamespace
      ),
    });
    return res.data;
  }
}
