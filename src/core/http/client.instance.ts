import { AxiosHttpClient } from "./http-client";
import type { HttpClient } from "./interfaces/http-client.interface";
import { authManager } from "@core/auth/auth-manager";
import { localStorageProvider } from "@core/storage/local-storage.provider";

const baseUrl = (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:3000/api/v1";

export const httpClient: HttpClient = new AxiosHttpClient({
  baseUrl,
  getAuthToken: () => localStorageProvider.get("auth.idToken"),
  authProvider: authManager,
  retryOptions: { retries: 1 },
});
