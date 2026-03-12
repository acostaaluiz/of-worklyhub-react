const INTERNAL_PATH_BASE = "https://worklyhub.local";
const HTTP_PROTOCOL = "http:";
const HTTPS_PROTOCOL = "https:";

const DEFAULT_INTERNAL_PATH_PREFIXES = [
  "/home",
  "/users",
  "/modules",
  "/tutorials",
  "/notifications",
  "/settings",
  "/company",
  "/billing",
  "/schedule",
  "/dashboard",
  "/finance",
  "/clients",
  "/inventory",
  "/people",
  "/work-order",
  "/growth",
  "/login",
  "/register",
  "/forgot-password",
  "/terms",
  "/privacy",
] as const;

export const DEFAULT_ATTACHMENT_HOST_SUFFIXES = [
  "amazonaws.com",
  "cloudfront.net",
  "storage.googleapis.com",
  "googleapis.com",
  "blob.core.windows.net",
  "firebasestorage.googleapis.com",
] as const;

type RuntimeEnvContainer = {
  __WORKLYHUB_RUNTIME_ENV__?: Record<string, string | undefined>;
};

type SafeAppPathOptions = {
  allowedPrefixes?: readonly string[];
};

type SafeExternalUrlOptions = {
  allowedHosts: readonly string[];
  allowedHostSuffixes?: readonly string[];
  allowHttpLocalhost?: boolean;
};

type TrustedHostOptions = {
  envKeys?: readonly string[];
  extraHosts?: readonly string[];
  includeWindowHost?: boolean;
  includeApiBaseUrlHost?: boolean;
};

function normalizeHost(value: string | null | undefined): string | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase().replace(/^\.+/, "").replace(/\.+$/, "");
  return normalized.length > 0 ? normalized : null;
}

function parseHostList(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => normalizeHost(item))
    .filter((item): item is string => Boolean(item));
}

function uniqueHosts(values: readonly (string | null | undefined)[]): string[] {
  const set = new Set<string>();
  values.forEach((value) => {
    const normalized = normalizeHost(value ?? undefined);
    if (normalized) set.add(normalized);
  });
  return [...set];
}

function isLoopbackHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

function readEnvValue(key: string): string | undefined {
  const runtimeEnv = (globalThis as RuntimeEnvContainer).__WORKLYHUB_RUNTIME_ENV__;
  const viteEnv = (import.meta as { env?: Record<string, string | undefined> }).env;
  const processEnv =
    typeof process !== "undefined"
      ? (process.env as Record<string, string | undefined>)
      : undefined;

  return runtimeEnv?.[key] ?? viteEnv?.[key] ?? processEnv?.[key];
}

function extractHostnameFromUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    return normalizeHost(new URL(value).hostname);
  } catch {
    return null;
  }
}

function matchesInternalPrefix(path: string, prefix: string): boolean {
  if (path === prefix) return true;
  return (
    path.startsWith(`${prefix}/`) ||
    path.startsWith(`${prefix}?`) ||
    path.startsWith(`${prefix}#`)
  );
}

function matchesAllowedHost(hostname: string, allowEntry: string): boolean {
  return hostname === allowEntry || hostname.endsWith(`.${allowEntry}`);
}

function normalizeInternalPath(value: string): string | null {
  const raw = value.trim();
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null;
  if (raw.includes("\\")) return null;

  try {
    const parsed = new URL(raw, INTERNAL_PATH_BASE);
    if (parsed.origin !== INTERNAL_PATH_BASE) return null;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return null;
  }
}

export function toSafeAppPath(
  value: string | null | undefined,
  options?: SafeAppPathOptions
): string | null {
  if (typeof value !== "string") return null;
  const normalized = normalizeInternalPath(value);
  if (!normalized) return null;

  const allowedPrefixes = options?.allowedPrefixes ?? DEFAULT_INTERNAL_PATH_PREFIXES;
  if (normalized === "/") return "/";

  const allowed = allowedPrefixes.some((prefix) => matchesInternalPrefix(normalized, prefix));
  return allowed ? normalized : null;
}

export function resolveTrustedExternalHosts(options?: TrustedHostOptions): string[] {
  const envKeys = options?.envKeys ?? ["VITE_ALLOWED_EXTERNAL_HOSTS"];
  const includeWindowHost = options?.includeWindowHost ?? true;
  const includeApiBaseUrlHost = options?.includeApiBaseUrlHost ?? true;

  const envHosts = envKeys.flatMap((key) => parseHostList(readEnvValue(key)));
  const apiBaseHost = includeApiBaseUrlHost
    ? extractHostnameFromUrl(readEnvValue("VITE_API_BASE_URL"))
    : null;
  const windowHost =
    includeWindowHost && typeof window !== "undefined"
      ? normalizeHost(window.location.hostname)
      : null;

  return uniqueHosts([...(options?.extraHosts ?? []), ...envHosts, apiBaseHost, windowHost]);
}

export function toSafeExternalUrl(
  value: string | null | undefined,
  options: SafeExternalUrlOptions
): string | null {
  if (typeof value !== "string") return null;
  const raw = value.trim();
  if (!raw) return null;

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return null;
  }

  const protocol = parsed.protocol.toLowerCase();
  const host = normalizeHost(parsed.hostname);
  if (!host) return null;

  if (protocol !== HTTPS_PROTOCOL) {
    const canAllowHttpLocalhost =
      protocol === HTTP_PROTOCOL &&
      (options.allowHttpLocalhost ?? true) &&
      isLoopbackHost(host);
    if (!canAllowHttpLocalhost) return null;
  }

  const allowedHosts = uniqueHosts(options.allowedHosts);
  const allowedSuffixes = uniqueHosts(options.allowedHostSuffixes ?? []);
  const byHost = allowedHosts.some((entry) => matchesAllowedHost(host, entry));
  const bySuffix = allowedSuffixes.some((suffix) => matchesAllowedHost(host, suffix));

  if (!byHost && !bySuffix) return null;

  return parsed.toString();
}
