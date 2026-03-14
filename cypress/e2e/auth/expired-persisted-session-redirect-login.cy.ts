function createExpiredToken(): string {
  const header = { alg: "none", typ: "JWT" };
  const payload = {
    sub: "uid-cypress-expired-session",
    exp: Math.floor(Date.now() / 1000) - 60 * 30,
  };

  const toBase64Url = (value: object) =>
    btoa(JSON.stringify(value))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");

  return `${toBase64Url(header)}.${toBase64Url(payload)}.unsigned`;
}

describe("Expired persisted session", () => {
  it("clears expired token/session and redirects protected route access to /login", () => {
    cy.visit("/home", {
      onBeforeLoad(win) {
        win.localStorage.setItem("auth.idToken", createExpiredToken());
        win.localStorage.setItem(
          "auth.session",
          JSON.stringify({
            uid: "uid-cypress-expired-session",
            claims: {},
            email: "expired.session@worklyhub.dev",
          }),
        );
      },
    });

    cy.location("pathname", { timeout: 40000 }).should("eq", "/login");

    cy.window().then((win) => {
      expect(win.localStorage.getItem("auth.idToken")).to.eq(null);
      expect(win.localStorage.getItem("auth.session")).to.eq(null);
    });
  });
});

export {};
