describe('Technology List View', () => {
  it('checks whether technology list is rendering correctly', () => {
    cy.visit('http://localhost:4200/technologies');
    cy.login('luke', 'test');

    cy.intercept('GET', '/category').as('getCategories');
    cy.intercept('GET', '/lifecycle').as('getLifecycles');
    cy.intercept('GET', '/technology').as('getTechnologies');
    cy.wait(['@getCategories', '@getLifecycles', '@getTechnologies']);

    cy.get('[data-test-id="technology-list"] > tbody > tr').should(
      'have.length',
      8,
    );
  });

  it('checks whether filter is working correctly', () => {
    cy.visit('http://localhost:4200/technologies');
    cy.login('luke', 'test');

    cy.intercept('GET', '/category').as('getCategories');
    cy.intercept('GET', '/lifecycle').as('getLifecycles');
    cy.intercept('GET', '/technology').as('getTechnologies');
    cy.wait(['@getCategories', '@getLifecycles', '@getTechnologies']);

    cy.get('[data-test-id="filter-button"]')
      .click()
      .get('mat-checkbox')
      .contains('Languages & Frameworks')
      .click({ force: true });
    cy.get('mat-checkbox').contains('Adopt').click({ force: true });
    cy.get('button').contains('Fertig').click({ force: true });
    cy.get('[data-test-id="technology-list"] > tbody > tr').should(
      'have.length',
      2,
    );

    cy.get('[data-test-id="filter-button"]')
      .click()
      .get('mat-checkbox')
      .contains('Alle Kategorien')
      .click({ force: true });
    cy.get('mat-checkbox').contains('Alle Lifecycles').click({ force: true });
    cy.get('[name="tag-select"]')
      .click({ force: true })
      .get('mat-option')
      .contains('Tag1')
      .click({ force: true });
    cy.get('mat-sidenav').click({ force: true });

    cy.get('button').contains('Fertig').click({ force: true });

    cy.get('[data-test-id="technology-list"] > tbody > tr').should(
      'have.length',
      2,
    );
  });
});
