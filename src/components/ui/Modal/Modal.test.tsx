import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';

describe('Modal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: 'Test Modal',
  };

  it('deve renderizar quando isOpen é true', () => {
    render(<Modal {...defaultProps}>Conteúdo do Modal</Modal>);
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
  });

  it('não deve renderizar quando isOpen é false', () => {
    render(<Modal {...defaultProps} isOpen={false}>Conteúdo</Modal>);
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  it('deve fechar o modal ao pressionar a tecla Escape', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Teste">
        Conteúdo
      </Modal>
    );

    await user.keyboard('{Escape}');
    expect(handleClose).toHaveBeenCalled();
  });

  it('não deve fechar o modal ao pressionar outra tecla', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Teste">
        Conteúdo
      </Modal>
    );

    await user.keyboard('{Enter}');
    expect(handleClose).not.toHaveBeenCalled();
  });
  
  it('deve chamar onClose ao clicar no botão fechar', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    render(<Modal {...defaultProps} onClose={handleClose}>Conteúdo</Modal>);
    await user.click(screen.getByLabelText('Fechar'));
    expect(handleClose).toHaveBeenCalled();
  });

  it('não deve fechar ao clicar no conteúdo do modal (stopPropagation)', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    render(<Modal {...defaultProps} onClose={handleClose}>Conteúdo</Modal>);
    await user.click(screen.getByText('Conteúdo'));
    expect(handleClose).not.toHaveBeenCalled();
  });
});
