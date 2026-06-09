describe('Radar', () => {
  it('checks whether the radar rendering is working', () => {
    cy.visit('http://localhost:4200');
    cy.login('luke', 'test');

    cy.intercept('GET', '/category').as('getCategories');
    cy.intercept('GET', '/lifecycle').as('getLifecycles');
    cy.intercept('GET', '/technology').as('getTechnologies');
    cy.wait(['@getCategories', '@getLifecycles', '@getTechnologies']);

    cy.get('[data-test-id="radar-container"]').should('be.visible');

    // Clicks a technology bubble and verifies the redirect
    cy.get('[data-test-id="VSCode"]').click();
    cy.location('pathname').should('contain', '/detail/-6');
    cy.go('back');

    // Clicks a category label and verifies the redirect
    cy.get('[data-test-id="Tools"]').click();
    cy.location('pathname').should('contain', '/radar/-2');
    cy.visit('http://localhost:4200');

    // Clicks a lifecycle label and verifies the redirect (forced because element is covered somehow)
    cy.get('[data-test-id="Assess"]').click({ force: true });
    cy.location('pathname').should('contain', '/technologies');
    cy.location('search').should('contain', 'lifecycleId=-2');
    cy.go('back');
  });

  it('show Tooltip', () => {
    cy.visit('http://localhost:4200');
    cy.login('luke', 'test');

    cy.intercept('GET', '/category').as('getCategories');
    cy.intercept('GET', '/lifecycle').as('getLifecycles');
    cy.intercept('GET', '/technology').as('getTechnologies');
    cy.wait(['@getCategories', '@getLifecycles', '@getTechnologies']);
    cy.get('[data-test-id="VSCode"]').trigger('mouseover');

    // Überprüfe, ob der Tooltip sichtbar ist
    cy.get('#bubble').should('be.visible');

    // Überprüfe den Inhalt des Tooltips
    cy.get('#title-text').should('have.text', 'VSCode');
    cy.get('#description-text').should(
      'have.text',
      'Eine Kurzbeschreibung zu VSCode',
    );
    cy.get('#score-text').should('have.text', '0');
    // ... Weitere Überprüfungen für andere Tooltip-Inhalte

    // Überprüfe, ob das Bild im Tooltip angezeigt wird
    //cy.get('#tooltip-image').should('be.visible');

    // Verlasse das Element, um den Tooltip auszublenden
    cy.get('[data-test-id="VSCode"]').trigger('mouseout');

    // Überprüfe, ob der Tooltip nicht mehr sichtbar ist
    cy.get('#bubble').should('not.be.visible');
  });
});
