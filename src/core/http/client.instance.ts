import { AxiosHttpClient } from "./http-client";
import type { HttpClient } from "./interfaces/http-client.interface";
import { authManager } from "@core/auth/auth-manager";

type RuntimeEnvContainer = {
  __WORKLYHUB_RUNTIME_ENV__?: Record<string, string | undefined>;
};

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function resolveCloudRunOrchestratorBaseUrl(): string | null {
  if (typeof window === "undefined") return null;

  const host = window.location.hostname;
  const isCloudRunHost = host.endsWith(".run.app");
  const isFrontendServiceHost = host.includes("worklyhub-frontend-");

  if (!isCloudRunHost || !isFrontendServiceHost) return null;

  const orchestratorHost = host.replace("worklyhub-frontend-", "worklyhub-orchestrator-");
  if (orchestratorHost === host) return null;

  return `${window.location.protocol}//${orchestratorHost}/api/v1`;
}

function resolveApiBaseUrl(): string {
  const runtimeEnv = (globalThis as RuntimeEnvContainer).__WORKLYHUB_RUNTIME_ENV__;
  const runtimeBaseUrl = asNonEmptyString(runtimeEnv?.VITE_API_BASE_URL);
  if (runtimeBaseUrl) return runtimeBaseUrl;

  const viteBaseUrl = asNonEmptyString(import.meta.env.VITE_API_BASE_URL as string);
  if (viteBaseUrl) return viteBaseUrl;

  const cloudRunDerived = resolveCloudRunOrchestratorBaseUrl();
  if (cloudRunDerived) return cloudRunDerived;

  return "http://localhost:3000/api/v1";
}

const baseUrl = resolveApiBaseUrl();

export const httpClient: HttpClient = new AxiosHttpClient({
  baseUrl,
  authProvider: authManager,
  retryOptions: { retries: 1 },
});
