const SESSION_SCHEMA_VERSION = 1;
const SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000;
const TOKEN_EXPIRATION_SKEW_MS = 60 * 1000;
const MAX_TOKEN_LENGTH = 4096;

type PersistedSessionEnvelope = {
  v: number;
  issuedAtMs: number;
  expiresAtMs: number;
  session: UserSessionPayload;
};

export type UserSessionPayload = {
  uid: string;
  claims: DataValue;
  email?: string;
  name?: string;
  photoUrl?: string;
};

type ParsePersistedSessionResult = {
  session: UserSessionPayload | null;
  shouldClear: boolean;
  migratedValue?: string;
};

type SessionIdentity = {
  uid?: string;
  email?: string;
};

function normalizeString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function toDataMap(value: unknown): DataMap | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as DataMap;
}

function normalizeSessionPayload(value: unknown): UserSessionPayload | null {
  const map = toDataMap(value);
  if (!map) return null;

  const uid = normalizeString(map.uid);
  if (!uid) return null;

  return {
    uid,
    claims: (map.claims ?? {}) as DataValue,
    email: normalizeString(map.email),
    name: normalizeString(map.name),
    photoUrl: normalizeString(map.photoUrl),
  };
}

function normalizeSessionIdentity(value: unknown): SessionIdentity | null {
  const map = toDataMap(value);
  if (!map) return null;

  const uid = normalizeString(map.uid);
  const email = normalizeString(map.email);

  if (!uid && !email) return null;
  return {
    ...(uid ? { uid } : {}),
    ...(email ? { email } : {}),
  };
}

function toBase64(input: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(input, "utf8").toString("base64");
  }

  if (typeof btoa === "function") {
    return btoa(input);
  }

  throw new Error("base64 encoding is not available");
}

function decodeBase64Url(value: string): string | null {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const withPadding =
    normalized + "=".repeat((4 - (normalized.length % 4)) % 4);

  try {
    if (typeof Buffer !== "undefined") {
      return Buffer.from(withPadding, "base64").toString("utf8");
    }
  } catch {
    // fallback below
  }

  try {
    if (typeof atob === "function") {
      return atob(withPadding);
    }
  } catch {
    // ignore and return null
  }

  return null;
}

function parseJwtPayload(token: string): DataMap | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const payloadRaw = decodeBase64Url(parts[1] ?? "");
  if (!payloadRaw) return null;

  try {
    const parsed = JSON.parse(payloadRaw) as DataMap;
    return toDataMap(parsed);
  } catch {
    return null;
  }
}

function resolveSessionExpirationMs(
  token: string | null,
  nowMs: number,
): number {
  const byAge = nowMs + SESSION_MAX_AGE_MS;
  const tokenExpirationMs = token ? getTokenExpirationMs(token) : null;

  if (!tokenExpirationMs) return byAge;

  const byToken = tokenExpirationMs - TOKEN_EXPIRATION_SKEW_MS;
  if (byToken <= nowMs) return byAge;

  return Math.min(byAge, byToken);
}

function parseEnvelope(value: unknown): PersistedSessionEnvelope | null {
  const map = toDataMap(value);
  if (!map) return null;
  if (map.v !== SESSION_SCHEMA_VERSION) return null;

  const issuedAtMs = typeof map.issuedAtMs === "number" ? map.issuedAtMs : NaN;
  const expiresAtMs =
    typeof map.expiresAtMs === "number" ? map.expiresAtMs : NaN;
  if (!Number.isFinite(issuedAtMs) || !Number.isFinite(expiresAtMs))
    return null;
  if (issuedAtMs <= 0 || expiresAtMs <= issuedAtMs) return null;

  const session = normalizeSessionPayload(map.session);
  if (!session) return null;

  return { v: SESSION_SCHEMA_VERSION, issuedAtMs, expiresAtMs, session };
}

export function sanitizeToken(
  rawToken: string | null | undefined,
): string | null {
  if (typeof rawToken !== "string") return null;
  const token = rawToken.trim();
  if (!token) return null;
  if (token.length > MAX_TOKEN_LENGTH) return null;
  for (let i = 0; i < token.length; i += 1) {
    const code = token.charCodeAt(i);
    if (code <= 32 || code === 127) return null;
  }
  return token;
}

export function getTokenExpirationMs(token: string): number | null {
  const payload = parseJwtPayload(token);
  const expSeconds = typeof payload?.exp === "number" ? payload.exp : NaN;
  if (!Number.isFinite(expSeconds) || expSeconds <= 0) return null;
  return Math.floor(expSeconds * 1000);
}

export function isTokenExpired(token: string, nowMs = Date.now()): boolean {
  const expirationMs = getTokenExpirationMs(token);
  if (!expirationMs) return false;
  return expirationMs <= nowMs + TOKEN_EXPIRATION_SKEW_MS;
}

export function parsePersistedSession(
  rawSession: string | null | undefined,
  rawToken: string | null | undefined,
  nowMs = Date.now(),
): ParsePersistedSessionResult {
  const token = sanitizeToken(rawToken);

  if (!token) {
    return {
      session: null,
      shouldClear: Boolean(rawSession || rawToken),
    };
  }

  if (isTokenExpired(token, nowMs)) {
    return {
      session: null,
      shouldClear: Boolean(rawSession || rawToken),
    };
  }

  if (!rawSession) {
    return {
      session: null,
      shouldClear: true,
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawSession);
  } catch {
    return { session: null, shouldClear: true };
  }

  const envelope = parseEnvelope(parsed);
  if (envelope) {
    if (envelope.expiresAtMs <= nowMs) {
      return { session: null, shouldClear: true };
    }

    return { session: envelope.session, shouldClear: false };
  }

  const legacy = normalizeSessionPayload(parsed);
  if (!legacy) return { session: null, shouldClear: true };

  return {
    session: legacy,
    shouldClear: false,
    migratedValue: serializeSession(legacy, token, nowMs),
  };
}

export function parseSessionPayload(
  rawSession: string | null | undefined,
): UserSessionPayload | null {
  if (!rawSession) return null;
  try {
    const parsed = JSON.parse(rawSession);
    const envelope = parseEnvelope(parsed);
    if (envelope) return envelope.session;
    return normalizeSessionPayload(parsed);
  } catch {
    return null;
  }
}

export function parseSessionIdentity(
  rawSession: string | null | undefined,
): SessionIdentity | null {
  if (!rawSession) return null;
  try {
    const parsed = JSON.parse(rawSession);
    const envelope = parseEnvelope(parsed);
    if (envelope) {
      return normalizeSessionIdentity(envelope.session);
    }
    return normalizeSessionIdentity(parsed);
  } catch {
    return null;
  }
}

export function serializeSession(
  session: UserSessionPayload,
  token: string | null,
  nowMs = Date.now(),
): string {
  const envelope: PersistedSessionEnvelope = {
    v: SESSION_SCHEMA_VERSION,
    issuedAtMs: nowMs,
    expiresAtMs: resolveSessionExpirationMs(token, nowMs),
    session: {
      uid: session.uid,
      claims: session.claims ?? {},
      ...(session.email ? { email: session.email } : {}),
      ...(session.name ? { name: session.name } : {}),
      ...(session.photoUrl ? { photoUrl: session.photoUrl } : {}),
    },
  };

  return JSON.stringify(envelope);
}

export function createUnsignedJwt(payload: Record<string, unknown>): string {
  const header = { alg: "none", typ: "JWT" };
  const toBase64Url = (value: object) =>
    toBase64(JSON.stringify(value))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
  return `${toBase64Url(header)}.${toBase64Url(payload)}.unsigned`;
}
