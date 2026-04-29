import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminTicketList } from './AdminTicketList';
import { getAdminTickets } from '@/lib/actions/admin-tickets';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/lib/actions/admin-tickets', () => ({
  getAdminTickets: vi.fn(),
}));

describe('AdminTicketList Component', () => {
  const mockTickets = [
    {
      id: '1',
      subject: 'Issue 1',
      type: 'ITEM_ISSUE',
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      user: { fullName: 'John Doe', email: 'john@example.com' },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render initial tickets', () => {
    render(
      <AdminTicketList 
        initialTickets={mockTickets} 
        initialTotal={1} 
        initialPages={1} 
      />
    );

    expect(screen.getByText('Issue 1')).toBeDefined();
    expect(screen.getByText('John Doe')).toBeDefined();
    expect(screen.getAllByText('Aberto').length).toBeGreaterThan(0);
  });

  it('should call getAdminTickets when filter changes', async () => {
    (getAdminTickets as any).mockResolvedValue({ tickets: [], total: 0, pages: 0 });
    
    render(
      <AdminTicketList 
        initialTickets={mockTickets} 
        initialTotal={1} 
        initialPages={1} 
      />
    );

    const searchInput = screen.getByPlaceholderText(/Buscar por assunto/);
    fireEvent.change(searchInput, { target: { value: 'New Search' } });

    await waitFor(() => {
      expect(getAdminTickets).toHaveBeenCalledWith(expect.objectContaining({
        search: 'New Search',
      }));
    });
  });
});
