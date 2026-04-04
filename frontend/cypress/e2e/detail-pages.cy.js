describe('Detail page regressions', () => {
  function makeToken(role = 'Admin') {
    const payload = {
      sub: `cypress-${role}-${Date.now()}`,
      email: `${role.toLowerCase()}@example.com`,
      role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600
    };

    return Cypress.Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  it('loads vendor edit page for an existing vendor', () => {
    const token = makeToken('Admin');
    const vendorName = `Editable Vendor ${Date.now()}`;

    cy.request({
      method: 'POST',
      url: '/api/vendors',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        legal_name: vendorName,
        risk_tier: 'Medium',
        category: 'Software'
      }
    }).then((vendorRes) => {
      cy.visit(`/vendors/${vendorRes.body.id}/edit`, {
        onBeforeLoad(win) {
          win.localStorage.setItem('mockRole', 'Admin');
        }
      });

      cy.contains('Edit Vendor').should('be.visible');
      cy.get('form').should('be.visible');
      cy.get('input').first().should('have.value', vendorName);
    });
  });

  it('loads contract detail page for an existing contract', () => {
    const token = makeToken('Admin');
    const vendorName = `Contract Detail Vendor ${Date.now()}`;
    const title = `Detail Contract ${Date.now()}`;

    cy.request({
      method: 'POST',
      url: '/api/vendors',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        legal_name: vendorName,
        risk_tier: 'Low'
      }
    }).then((vendorRes) => {
      cy.request({
        method: 'POST',
        url: '/api/contracts',
        headers: { Authorization: `Bearer ${token}` },
        body: {
          title,
          vendor_id: vendorRes.body.id,
          contract_owner: 'owner@example.com',
          start_date: '2026-01-01',
          end_date: '2026-12-31',
          status: 'Active',
          contract_value: 50000,
          currency: 'USD',
          external_reference_id: 'REF-2026-001',
          contract_type: 'Subscription',
          billing_frequency: 'Annual',
          data_classification: 'Confidential',
          regulatory_tags: 'SOX',
          key_obligations: 'Quarterly reporting',
          insurance_required: true,
          audit_rights_flag: true
        }
      }).then((contractRes) => {
        cy.visit(`/contracts/${contractRes.body.id}`, {
          onBeforeLoad(win) {
            win.localStorage.setItem('mockRole', 'Admin');
          }
        });

        cy.contains('Core Information').should('be.visible');
        cy.contains(title).should('be.visible');
        cy.contains(vendorName).should('be.visible');
        cy.contains('owner@example.com').should('be.visible');
        cy.contains('REF-2026-001').should('be.visible');
        cy.contains('Subscription').should('be.visible');
        cy.contains('Annual').should('be.visible');
        cy.contains('Confidential').should('be.visible');
        cy.contains('Quarterly reporting').should('be.visible');
        cy.contains('SOX').should('be.visible');
      });
    });
  });

  it('loads contract edit page with existing values', () => {
    const token = makeToken('Admin');
    const vendorName = `Editable Contract Vendor ${Date.now()}`;
    const title = `Editable Contract ${Date.now()}`;

    cy.request({
      method: 'POST',
      url: '/api/vendors',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        legal_name: vendorName,
        risk_tier: 'Medium'
      }
    }).then((vendorRes) => {
      cy.request({
        method: 'POST',
        url: '/api/contracts',
        headers: { Authorization: `Bearer ${token}` },
        body: {
          title,
          vendor_id: vendorRes.body.id,
          contract_owner: 'editor@example.com',
          start_date: '2026-02-01',
          end_date: '2027-02-01',
          status: 'Under Review',
          external_reference_id: 'EDIT-42',
          contract_type: 'MSA',
          contract_value: 120000,
          currency: 'USD',
          payment_terms: 'Net 30',
          key_obligations: 'Monthly service review'
        }
      }).then((contractRes) => {
        cy.visit(`/contracts/${contractRes.body.id}/edit`, {
          onBeforeLoad(win) {
            win.localStorage.setItem('mockRole', 'Admin');
          }
        });

        cy.contains('Edit Contract').should('be.visible');
        cy.get('form').should('be.visible');
        cy.get('input').first().should('have.value', title);
        cy.get('input').eq(2).should('have.value', 'EDIT-42');
        cy.get('input[type="date"]').eq(0).should('have.value', '2026-02-01');
        cy.get('input[type="date"]').eq(1).should('have.value', '2027-02-01');
      });
    });
  });
});