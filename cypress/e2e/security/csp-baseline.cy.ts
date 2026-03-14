describe("Security headers baseline", () => {
  it("exposes a restrictive CSP policy in document meta", () => {
    cy.visit("/login");

    cy.get('meta[http-equiv="Content-Security-Policy"]')
      .should("exist")
      .invoke("attr", "content")
      .then((content) => {
        const value = content ?? "";
        expect(value).to.contain("default-src 'self'");
        expect(value).to.contain("frame-src 'none'");
        expect(value).to.contain("object-src 'none'");
        expect(value).to.contain("manifest-src 'self'");
        expect(value).to.contain("media-src 'self'");
        expect(value).to.not.contain("connect-src 'self' https: http:");
      });
  });
});

export {};
