/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//

Cypress.Commands.add('login', (username: string, password: string) => {
  return cy.origin(
    'http://localhost:8080',
    { args: { username, password } },
    ({ username, password }) => {
      cy.get('#username').type(username);
      cy.get('#password').type(password);
      cy.get('#kc-login').click();
    },
  );
});

Cypress.Commands.add('setTestId', (id) => {
  Cypress.env('testId', id);
});

declare global {
  namespace Cypress {
    interface Chainable {
      login(username: string, password: string): Chainable<void>;
    }
  }
}
