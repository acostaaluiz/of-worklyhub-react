export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type HttpQueryPrimitive = string | number | boolean | null | undefined;
export type HttpQuery = Record<string, HttpQueryPrimitive>;

export interface HttpRequestConfig<TBody = DataValue> {
  url: string;
  method: HttpMethod;
  query?: HttpQuery;
  body?: TBody;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  timeoutMs?: number;
  correlationId?: string;
}

export interface HttpResponse<TData = DataValue> {
  data: TData;
  status: number;
  headers: Record<string, string>;
  correlationId?: string;
}

export interface HttpClient {
  request<TData, TBody = DataValue>(
    config: HttpRequestConfig<TBody>
  ): Promise<HttpResponse<TData>>;
}
