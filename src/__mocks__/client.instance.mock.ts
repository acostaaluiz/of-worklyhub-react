import type {
  HttpClient,
  HttpRequestConfig,
  HttpResponse,
} from '@core/http/interfaces/http-client.interface';

export const httpClient: HttpClient = {
  request: async <TData, TBody = DataValue>(
    _config: HttpRequestConfig<TBody>
  ): Promise<HttpResponse<TData>> => ({
    data: null as TData,
    status: 200,
    headers: {},
    correlationId: '',
  }),
};
