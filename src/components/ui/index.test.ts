import { describe, it, expect } from 'vitest';
import * as UI from './index';

describe('UI components index', () => {
  it('deve exportar todos os componentes', () => {
    expect(UI.Button).toBeDefined();
    expect(UI.Input).toBeDefined();
    expect(UI.Modal).toBeDefined();
    expect(UI.Card).toBeDefined();
    expect(UI.Badge).toBeDefined();
    expect(UI.Sidebar).toBeDefined();
    expect(UI.SkeletonText).toBeDefined();
    expect(UI.SkeletonCard).toBeDefined();
    expect(UI.SkeletonTable).toBeDefined();
    expect(UI.ToastContainer).toBeDefined();
  });
});
