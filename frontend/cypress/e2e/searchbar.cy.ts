describe('Searchbar', () => {
  beforeEach(function () {
    cy.visit('http://localhost:4200');
    cy.login('luke', 'test');
    cy.intercept('GET', '/technology').as('getTechnologies');
    cy.wait('@getTechnologies');
  });

  it('checks if the searchbar initializes correctly', () => {
    cy.get('[data-test-id="searchbar-input"]').click();
    cy.get('[data-test-id="search-option"]').should('have.length', 8);
  });

  it('checks if navigation on click works correctly', () => {
    cy.get('[data-test-id="searchbar-input"]').click();
    cy.get('[data-test-id="search-option"]').contains('VSCode').click();
    cy.location('pathname').should('contain', '/detail/-6');
  });
});
