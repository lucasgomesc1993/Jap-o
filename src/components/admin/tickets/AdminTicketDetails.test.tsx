import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminTicketDetails } from './AdminTicketDetails';
import { updateTicketStatus, replyTicketAdmin } from '@/lib/actions/admin-tickets';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/lib/actions/admin-tickets', () => ({
  updateTicketStatus: vi.fn(),
  replyTicketAdmin: vi.fn(),
}));

vi.mock('@/components/tickets/TicketChat', () => ({
  TicketChat: ({ onReply }: any) => (
    <div data-testid="mock-chat">
      <button onClick={() => onReply({ ticketId: '1', content: 'test reply' })}>
        Reply
      </button>
    </div>
  ),
}));

describe('AdminTicketDetails Component', () => {
  const mockTicket = {
    id: '1',
    subject: 'Issue 1',
    type: 'ITEM_ISSUE',
    status: 'OPEN',
    createdAt: new Date().toISOString(),
    user: { fullName: 'John Doe', email: 'john@example.com' },
    messages: [],
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render ticket details', () => {
    render(<AdminTicketDetails ticket={mockTicket} />);

    expect(screen.getByText('Issue 1')).toBeDefined();
    expect(screen.getByText('John Doe')).toBeDefined();
    expect(screen.getByText('Aberto')).toBeDefined();
  });

  it('should call updateTicketStatus when status button is clicked', async () => {
    render(<AdminTicketDetails ticket={mockTicket} />);

    const statusBtn = screen.getByText('Marcar em Análise');
    fireEvent.click(statusBtn);

    await waitFor(() => {
      expect(updateTicketStatus).toHaveBeenCalledWith('1', 'IN_REVIEW');
    });
  });

  it('should call replyTicketAdmin when chat triggers reply', async () => {
    render(<AdminTicketDetails ticket={mockTicket} />);

    const replyBtn = screen.getByText('Reply');
    fireEvent.click(replyBtn);

    await waitFor(() => {
      expect(replyTicketAdmin).toHaveBeenCalled();
    });
  });
});
