import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Modal } from './Modal';

describe('Modal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: 'Título do Modal',
  };

  it('renderiza quando isOpen=true', () => {
    render(<Modal {...defaultProps}><p>Conteúdo</p></Modal>);
    expect(screen.getByText('Título do Modal')).toBeInTheDocument();
    expect(screen.getByText('Conteúdo')).toBeInTheDocument();
  });

  it('não renderiza quando isOpen=false', () => {
    render(<Modal {...defaultProps} isOpen={false}><p>Conteúdo</p></Modal>);
    expect(screen.queryByText('Título do Modal')).not.toBeInTheDocument();
  });

  it('fecha ao pressionar ESC', () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose}><p>Conteúdo</p></Modal>);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('fecha ao clicar no overlay', () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose}><p>Conteúdo</p></Modal>);
    const overlay = screen.getByRole('dialog').parentElement;
    if (overlay) fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('não fecha ao clicar dentro do modal', () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose}><p>Conteúdo</p></Modal>);
    fireEvent.click(screen.getByText('Conteúdo'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('tem aria-modal=true', () => {
    render(<Modal {...defaultProps}><p>Conteúdo</p></Modal>);
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('tem aria-labelledby apontando para o título', () => {
    render(<Modal {...defaultProps}><p>Conteúdo</p></Modal>);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
  });
});
