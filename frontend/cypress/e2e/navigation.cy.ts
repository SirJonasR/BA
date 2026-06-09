describe('Navigation', () => {
  it('checks if navigation renders correctly', () => {
    cy.visit('http://localhost:4200');
    cy.login('luke', 'test');

    cy.intercept('GET', '/category').as('getCategories');
    cy.intercept('GET', '/lifecycle').as('getLifecycles');
    cy.intercept('GET', '/technology').as('getTechnologies');
    cy.wait(['@getCategories', '@getLifecycles', '@getTechnologies']);

    // checks if navigation to technology list works
    cy.get('[data-test-id="menu-button"]').click();
    cy.get('[data-test-id="category"]')
      .contains('Kategorien')
      .click({ force: true });
    cy.location('pathname').should('contain', '/technologies');
    cy.get('[data-test-id="menu-button"]').click({ force: true }); // close menu

    // checks if navigation to a specific category works
    cy.get('[data-test-id="menu-button"]').click({ force: true });
    cy.get('[data-test-id="category"]')
      .contains('Kategorien')
      .rightclick({ force: true });
    cy.get('[data-test-id="categories-menu"]')
      .contains('Tools')
      .should('be.visible')
      .click();
    cy.location().should((location) => {
      expect(location.search).to.eq('?categoryId=-2');
      expect(location.pathname).to.eq('/technologies');
    });

    // checks if navigation to a specific lifecycle works
    cy.get('[data-test-id="menu-button"]').click();
    cy.get('[data-test-id="lifecycle"]').contains('Lebenszyklen').rightclick();
    cy.get('[data-test-id="lifecycles-menu"]')
      .contains('Assess')
      .should('be.visible')
      .click();
    cy.location().should((location) => {
      expect(location.search).to.eq('?lifecycleId=-2');
      expect(location.pathname).to.eq('/technologies');
    });
  });
});
