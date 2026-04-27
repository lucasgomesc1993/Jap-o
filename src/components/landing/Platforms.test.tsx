import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Platforms } from './Platforms';

describe('Platforms', () => {
  it('renderiza a lista de plataformas', () => {
    render(<Platforms />);
    expect(screen.getByText('Amazon JP')).toBeInTheDocument();
    expect(screen.getByText('Mercari')).toBeInTheDocument();
    expect(screen.getByText('Rakuten')).toBeInTheDocument();
    expect(screen.getByText('Yahoo Auctions')).toBeInTheDocument();
  });

  it('exibe os domínios', () => {
    render(<Platforms />);
    expect(screen.getByText('amazon.co.jp')).toBeInTheDocument();
    expect(screen.getByText('mercari.com')).toBeInTheDocument();
  });
});
