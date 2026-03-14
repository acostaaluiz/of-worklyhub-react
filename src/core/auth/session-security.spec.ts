import {
  createUnsignedJwt,
  getTokenExpirationMs,
  isTokenExpired,
  parsePersistedSession,
  parseSessionIdentity,
  parseSessionPayload,
  sanitizeToken,
  serializeSession,
} from "./session-security";

describe("session-security", () => {
  const fixedNow = 1_700_000_000_000;

  it("sanitizes persisted token values", () => {
    expect(sanitizeToken("   token-123   ")).toBe("token-123");
    expect(sanitizeToken("")).toBeNull();
    expect(sanitizeToken("token with spaces")).toBeNull();
    expect(sanitizeToken(null)).toBeNull();
  });

  it("extracts JWT expiration and evaluates expiry with skew", () => {
    const validToken = createUnsignedJwt({
      exp: Math.floor((fixedNow + 5 * 60 * 1000) / 1000),
    });
    const expiredToken = createUnsignedJwt({
      exp: Math.floor((fixedNow - 5 * 60 * 1000) / 1000),
    });

    expect(getTokenExpirationMs(validToken)).toBeGreaterThan(fixedNow);
    expect(isTokenExpired(validToken, fixedNow)).toBe(false);
    expect(isTokenExpired(expiredToken, fixedNow)).toBe(true);
  });

  it("clears persisted session when token is missing or expired", () => {
    const rawSession = JSON.stringify({
      uid: "uid-1",
      claims: { role: "owner" },
      email: "owner@worklyhub.com",
    });
    const expiredToken = createUnsignedJwt({
      exp: Math.floor((fixedNow - 5 * 60 * 1000) / 1000),
    });

    expect(parsePersistedSession(rawSession, null, fixedNow)).toEqual({
      session: null,
      shouldClear: true,
    });
    expect(parsePersistedSession(rawSession, expiredToken, fixedNow)).toEqual({
      session: null,
      shouldClear: true,
    });
  });

  it("migrates legacy persisted session into secure envelope", () => {
    const token = createUnsignedJwt({
      exp: Math.floor((fixedNow + 30 * 60 * 1000) / 1000),
    });
    const rawSession = JSON.stringify({
      uid: "uid-1",
      claims: { role: "owner" },
      email: "owner@worklyhub.com",
    });

    const parsed = parsePersistedSession(rawSession, token, fixedNow);

    expect(parsed.shouldClear).toBe(false);
    expect(parsed.session).toEqual({
      uid: "uid-1",
      claims: { role: "owner" },
      email: "owner@worklyhub.com",
      name: undefined,
      photoUrl: undefined,
    });
    expect(parsed.migratedValue).toBeTruthy();
    expect(parseSessionPayload(parsed.migratedValue ?? null)).toMatchObject({
      uid: "uid-1",
      email: "owner@worklyhub.com",
    });
    expect(parseSessionIdentity(parsed.migratedValue ?? null)).toMatchObject({
      uid: "uid-1",
      email: "owner@worklyhub.com",
    });
  });

  it("uses and validates stored secure envelope", () => {
    const token = createUnsignedJwt({
      exp: Math.floor((fixedNow + 60 * 60 * 1000) / 1000),
    });
    const value = serializeSession(
      {
        uid: "uid-1",
        claims: { role: "owner" },
        email: "owner@worklyhub.com",
      },
      token,
      fixedNow,
    );

    const parsed = parsePersistedSession(
      value,
      token,
      fixedNow + 5 * 60 * 1000,
    );

    expect(parsed.shouldClear).toBe(false);
    expect(parsed.migratedValue).toBeUndefined();
    expect(parsed.session).toMatchObject({
      uid: "uid-1",
      email: "owner@worklyhub.com",
    });
  });

  it("clears secure envelope when expired by stored expiration", () => {
    const token = createUnsignedJwt({
      exp: Math.floor((fixedNow + 60 * 60 * 1000) / 1000),
    });
    const value = serializeSession(
      {
        uid: "uid-1",
        claims: { role: "owner" },
        email: "owner@worklyhub.com",
      },
      token,
      fixedNow,
    );

    const parsed = parsePersistedSession(
      value,
      token,
      fixedNow + 13 * 60 * 60 * 1000,
    );
    expect(parsed).toEqual({
      session: null,
      shouldClear: true,
    });
  });
});
