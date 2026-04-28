import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KPIStats } from './KPIStats';
import { AlertsList } from './AlertsList';

describe('Admin Dashboard Components', () => {
  describe('KPIStats', () => {
    it('deve renderizar 5 KPI cards', () => {
      const stats = {
        pendingPurchases: 10,
        warehouseItems: 25,
        preparingShipments: 5,
        openTickets: 3,
        monthlyRevenue: 1500.50
      };

      render(<KPIStats stats={stats} />);

      expect(screen.getByText('Pedidos p/ Compra')).toBeDefined();
      expect(screen.getByText('Itens no Armazém')).toBeDefined();
      expect(screen.getByText('Prontos p/ Despacho')).toBeDefined();
      expect(screen.getByText('Chamados Abertos')).toBeDefined();
      expect(screen.getByText('Receita do Mês')).toBeDefined();
      
      expect(screen.getByText('10')).toBeDefined();
      expect(screen.getByText('25')).toBeDefined();
      expect(screen.getByText('5')).toBeDefined();
      expect(screen.getByText('3')).toBeDefined();
    });

    it('deve renderizar skeletons quando estiver carregando', () => {
      const { container } = render(<KPIStats isLoading={true} />);
      // Deve ter classes de skeleton (baseado no módulo CSS ou tags de skeleton)
      // Como estamos usando Skeleton component, ele deve estar presente
      expect(container.querySelectorAll('[class*="skeleton"]').length).toBeGreaterThan(0);
    });
  });

  describe('AlertsList', () => {
    it('deve renderizar alertas quando existirem', () => {
      const alerts = {
        storageExpiring: [
          { id: '1', name: 'Item Expira', freeStorageDeadline: new Date(), user: { fullName: 'João Silva' } }
        ],
        pendingPayments: [
          { id: '2', productName: 'Pedido Pendente', totalBrl: 100, user: { fullName: 'Maria Souza' } }
        ]
      };

      render(<AlertsList alerts={alerts} />);

      expect(screen.getByText('Item Expira')).toBeDefined();
      expect(screen.getByText('João Silva')).toBeDefined();
      expect(screen.getByText('Pedido Pendente')).toBeDefined();
      expect(screen.getByText('Maria Souza')).toBeDefined();
    });

    it('deve exibir mensagem "Tudo em dia" quando não houver alertas', () => {
      const alerts = {
        storageExpiring: [],
        pendingPayments: []
      };

      render(<AlertsList alerts={alerts} />);

      expect(screen.getByText('Tudo em dia!')).toBeDefined();
    });

    it('deve renderizar skeletons quando estiver carregando', () => {
      const { container } = render(<AlertsList isLoading={true} />);
      expect(container.querySelectorAll('[class*="skeleton"]').length).toBeGreaterThan(0);
    });
  });
});
