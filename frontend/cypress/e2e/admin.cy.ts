describe('Admin', () => {
  it('checks whether header is rendering correctly', () => {
    cy.visit('http://localhost:4200');
    cy.login('luke', 'test');

    cy.get('[data-test-id="text-admin"]').should('be.visible');
  });

  it('checks whether header is rendering correctly if not admin', () => {
    cy.visit('http://localhost:4200');
    cy.login('leia', 'test');

    cy.get('[data-test-id="text-admin"]').should('not.exist');
  });

  it('checks whether delete button is not there as a regular user', () => {
    cy.visit('http://localhost:4200/detail/-2');
    cy.login('leia', 'test');

    cy.intercept('GET', '/category').as('getCategories');
    cy.intercept('GET', '/lifecycle').as('getLifecycles');
    cy.intercept('GET', '/technology/-2').as('getTechnology');
    cy.wait(['@getCategories', '@getLifecycles', '@getTechnology']);

    cy.get('[data-test-id="button-remove-technology"]').should('not.exist');
  });
});
