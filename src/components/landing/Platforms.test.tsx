import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Platforms } from './Platforms';

describe('Platforms', () => {
  it('renderiza a lista de plataformas', () => {
    render(<Platforms />);
    expect(screen.getAllByText('Amazon JP')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Mercari')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Rakuten')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Yahoo Auctions')[0]).toBeInTheDocument();
  });
});
