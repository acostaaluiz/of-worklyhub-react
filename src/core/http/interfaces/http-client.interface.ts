export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface HttpRequestConfig<TBody = unknown> {
  url: string;
  method: HttpMethod;
  query?: Record<string, string | number | boolean | null | undefined>;
  body?: TBody;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  timeoutMs?: number;
  correlationId?: string;
}

export interface HttpResponse<TData = unknown> {
  data: TData;
  status: number;
  headers: Record<string, string>;
  correlationId?: string;
}

export interface HttpClient {
  request<TData, TBody = unknown>(
    config: HttpRequestConfig<TBody>
  ): Promise<HttpResponse<TData>>;
}
