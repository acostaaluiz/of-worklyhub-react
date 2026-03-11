declare global {
  namespace Cypress {
    interface Chainable {
      getBySel(selector: string): Chainable<JQuery<HTMLElement>>;
      selectFirstAntdOption(selector: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}

Cypress.Commands.add("getBySel", (selector: string) => {
  return cy.get(`[data-cy="${selector}"]`);
});

Cypress.Commands.add("selectFirstAntdOption", (selector: string) => {
  cy.getBySel(selector).click({ force: true });
  return cy
    .get(".ant-select-dropdown:visible .ant-select-item-option")
    .should("have.length.greaterThan", 0)
    .first()
    .click({ force: true });
});

export {};
