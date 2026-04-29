import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import LandingPage from '../app/page';
import DashboardLayout from '../app/dashboard/layout';
import React from 'react';

describe('Acessibilidade (WCAG AA)', () => {
  it('a landing page não deve ter violações de acessibilidade', async () => {
    const { container } = render(<LandingPage />);
    const results = await axe(container);
    
    if (results.violations.length > 0) {
      console.log('Acessibilidade (LandingPage):', JSON.stringify(results.violations, null, 2));
    }
    
    expect(results.violations).toEqual([]);
  });

  it('o layout do dashboard não deve ter violações de acessibilidade', async () => {
    const { container } = render(
      <DashboardLayout>
        <div>Conteúdo de teste</div>
      </DashboardLayout>
    );
    const results = await axe(container);

    if (results.violations.length > 0) {
      console.log('Acessibilidade (DashboardLayout):', JSON.stringify(results.violations, null, 2));
    }

    expect(results.violations).toEqual([]);
  });
});
