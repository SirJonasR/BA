describe('Technology', () => {
  it('checks whether technology creating is functional', () => {
    cy.visit('http://localhost:4200/technologies/add');
    cy.login('luke', 'test');

    cy.intercept('GET', '/category').as('getCategories');
    cy.intercept('GET', '/lifecycle').as('getLifecycles');
    cy.intercept('GET', '/customer').as('getCustomers');
    cy.wait(['@getCategories', '@getLifecycles', '@getCustomer']);

    cy.get('[data-test-id="technology-name-input"]').type('Deno');
    cy.get('[data-test-id="technology-short-description-textarea"]').type(
      'short-description',
    );
    cy.get('[data-test-id="technology-description-textarea"]').type(
      'A Node.js alternative.',
    );
    cy.get('[data-test-id="technology-category-select"]')
      .click()
      .get('mat-option')
      .contains('Languages & Frameworks')
      .click();
    cy.get('[data-test-id="technology-lifecycle-select"]')
      .click()
      .get('mat-option')
      .contains('Monitor')
      .click();
    cy.get('[data-test-id="technology-tags[0]-input"]').type('testTag');

    cy.get('input[placeholder="Kunden hinzufügen"]').type('Neuer Kunde');
    cy.get('button[matTooltip="Neuen Kunden anlegen"]').click();
    cy.get('.selected-option-container').should('contain', 'Neuer Kunde');
    cy.get('[data-test-id="customer-lifecycle-select-Neuer Kunde"]')
      .click()
      .get('mat-option')
      .contains('Maintain')
      .click();
    cy.get('.option-details').should('contain', 'Maintain');
    cy.get('.option-details').should('contain', 'Neuer Kunde');
    cy.get('button[matTooltip="Neuen Kunden anlegen"]').click();

    cy.get('.mat-mdc-snack-bar-label').should('be.visible');

    cy.get('input[placeholder="Kunden hinzufügen"]').type('neuer    Kunde');
    cy.get('button[matTooltip="Neuen Kunden anlegen"]').click();
    cy.get('.mat-mdc-snack-bar-label').should('be.visible');

    cy.get('input[placeholder="Kunden hinzufügen"]').clear();

    cy.get('input[placeholder="Kunden hinzufügen"]').type('Test Kunde');
    cy.get('button[matTooltip="Neuen Kunden anlegen"]').click();

    cy.get('[data-test-id="customer-lifecycle-select-Test Kunde"]')
      .click()
      .get('mat-option')
      .contains('Assess')
      .click();

    cy.get('[data-test-id="form-submit-button"]').click();
    cy.location('pathname').should('contain', '/detail');
    cy.url().then((url) => {
      let id = url.match(/\/detail\/(\d+)/)[1];
      cy.setTestId(id);
    });
  });

  it('Checks whether technology detail displays correct technology data', () => {
    const id = Cypress.env('testId');
    cy.visit(`http://localhost:4200/detail/${id}`);
    cy.login('luke', 'test');
    cy.intercept('GET', '/category').as('getCategories');
    cy.intercept('GET', '/lifecycle').as('getLifecycles');
    cy.intercept('GET', `/technology/${id}`).as('getTechnology');
    cy.wait(['@getCategories', '@getLifecycles', '@getTechnology']);

    cy.get('[data-test-id="technology-name"]').should('contain', 'Deno');

    cy.get('[data-test-id="technology-category"]').should(
      'contain',
      'Languages & Frameworks',
    );

    cy.get('[data-test-id="technology-lifecycle"]').should(
      'contain',
      'Monitor',
    );

    cy.get('[data-test-id="technology-shortDescription"]').should(
      'contain',
      'short-description',
    );

    cy.get('[data-test-id="technology-description-view"]').should(
      'contain',
      'A Node.js alternative.',
    );

    cy.get('[data-test-id="technology-customers"]').should(
      'contain',
      'Neuer Kunde | Maintain',
    );

    cy.get('[data-test-id="technology-tags"]').should('contain', 'testTag');
  });

  // TODO: add test for reset voting
  it('checks whether technology voting is functional', () => {
    const id = Cypress.env('testId');
    cy.visit(`http://localhost:4200/detail/${id}`);
    cy.login('luke', 'test');
    cy.intercept('GET', '/category').as('getCategories');
    cy.intercept('GET', '/lifecycle').as('getLifecycles');
    cy.intercept('GET', `/technology/${id}`).as('getTechnology');
    cy.wait(['@getCategories', '@getLifecycles', '@getTechnology']);

    // Vote up
    cy.get('[data-test-id="button-vote-up"]').click();
    cy.get('[data-test-id="technology-score"]').contains('1');

    // Vote down
    cy.get('[data-test-id="button-vote-down"]').click();
    cy.get('[data-test-id="technology-score"]').contains('-1');
    // Reset vote
    cy.get('[data-test-id="button-vote-down"]').click();
    cy.get('[data-test-id="technology-score"]').contains('0');

    // Vote up
    cy.get('[data-test-id="button-vote-up"]').click();
    cy.get('[data-test-id="technology-score"]').contains('1');
    // Reset vote up
    cy.get('[data-test-id="button-vote-up"]').click();
    cy.get('[data-test-id="technology-score"]').contains('0');
  });

  it('checks whether technology editing is functional', () => {
    const id = Cypress.env('testId');
    cy.visit(`http://localhost:4200/detail/${id}`);
    cy.login('luke', 'test');

    cy.intercept('GET', '/category').as('getCategories');
    cy.intercept('GET', '/lifecycle').as('getLifecycles');
    cy.intercept('GET', `/technology/${id}`).as('getTechnology');

    cy.wait(['@getCategories', '@getLifecycles', '@getTechnology']);

    cy.get('[data-test-id="button-edit-technology"]').click();
    cy.intercept('GET', '/customer').as('getCustomers');
    cy.wait(['@getCustomer']);

    cy.get('[data-test-id="technology-name-input"]').type('...');
    cy.get('[data-test-id="technology-description-textarea"]').type('...');
    cy.get('[data-test-id="technology-category-select"]')
      .click()
      .get('mat-option')
      .contains('Platforms')
      .click();
    cy.get('[data-test-id="technology-tags[0]-input"]').type('...');

    cy.get('[data-test-id="customer-remove-button-Test Kunde"]').click();

    cy.get('[data-test-id="customer-lifecycle-select-Neuer Kunde"]')
      .click()
      .get('mat-option')
      .contains('Assess')
      .click();

    cy.get('input[placeholder="Kunden hinzufügen"]').click().type('Test Kunde');

    cy.get('input[placeholder="Kunden hinzufügen"]')
      .type('{downarrow}')
      .type('{enter}');

    cy.get('[data-test-id="customer-lifecycle-select-Test Kunde"]')
      .click()
      .get('mat-option')
      .contains('Adopt')
      .click();

    cy.get('[data-test-id="form-submit-button"]').click();
    cy.location('pathname').should('eq', `/detail/${id}`);
  });

  it('checks whether technology tile view displays created technology', () => {
    const id = Cypress.env('testId');
    cy.visit('http://localhost:4200');
    cy.login('luke', 'test');

    cy.get('[data-test-id="Platforms"]').click();
    cy.get('[data-test-id="technology-tiles"]')
      .invoke('attr', 'ng-reflect-id')
      .should('contain', id);
  });

  it('checks whether technology deleting is functional', () => {
    const id = Cypress.env('testId');
    cy.visit(`http://localhost:4200/detail/${id}`);
    cy.login('luke', 'test');

    cy.intercept('GET', '/category').as('getCategories');
    cy.intercept('GET', '/lifecycle').as('getLifecycles');
    cy.intercept('GET', `/technology/${id}`).as('getTechnology');
    cy.wait(['@getCategories', '@getLifecycles', '@getTechnology']);

    // Open dialog, click abort button and expect everything to stay as is
    cy.get('[data-test-id="button-remove-technology"]').click();
    cy.get('[data-test-id="delete-confirmation-abort-button"]').click();

    // Open dialog, click confirm button and expect a redirect
    cy.get('[data-test-id="button-remove-technology"]').click();
    cy.get('[data-test-id="delete-confirmation-confirm-button"]').click();
    cy.location('pathname').should('eq', '/technologies');
  });

  it('checks whether technology description markdown works', () => {
    cy.visit('http://localhost:4200/technologies/add');
    cy.login('luke', 'test');

    cy.intercept('GET', '/category').as('getCategories');
    cy.intercept('GET', '/lifecycle').as('getLifecycles');
    cy.wait(['@getCategories', '@getLifecycles']);

    cy.get('[data-test-id="technology-name-input"]').type('Test');
    cy.get('[data-test-id="technology-short-description-textarea"]').type(
      'short-description',
    );
    cy.get('[data-test-id="technology-description-textarea"]').type(
      '**Fat Text**',
    );
    cy.get('[data-test-id="technology-category-select"]')
      .click()
      .get('mat-option')
      .contains('Languages & Frameworks')
      .click();
    cy.get('[data-test-id="technology-lifecycle-select"]')
      .click()
      .get('mat-option')
      .contains('Monitor')
      .click();
    cy.get('[data-test-id="form-submit-button"]').click();
    cy.location('pathname').should('contain', '/detail');

    cy.get('[data-test-id="technology-description-view"]')
      .get('strong')
      .should('exist')
      .should('be.visible');
    // Open dialog, click abort button and expect everything to stay as is
    cy.get('[data-test-id="button-remove-technology"]').click();
    cy.get('[data-test-id="delete-confirmation-abort-button"]').click();

    // Open dialog, click confirm button and expect a redirect
    cy.get('[data-test-id="button-remove-technology"]').click();
    cy.get('[data-test-id="delete-confirmation-confirm-button"]').click();
  });
});
