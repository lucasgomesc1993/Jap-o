import prisma from '@/lib/prisma/client';
import { FinancialFilter } from '@/lib/validations/financial-filter.schema';
import { startOfDay, endOfDay, format } from 'date-fns';
import { TransactionType } from '@prisma/client';

export async function getFinancialReport(filter: FinancialFilter) {
  const { dateFrom, dateTo } = filter;

  const where: any = {};
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = startOfDay(dateFrom);
    if (dateTo) where.createdAt.lte = endOfDay(dateTo);
  }

  // 1. Receita (Revenue)
  // Taxas de serviço e fixas de pedidos pagos (PURCHASED, IN_TRANSIT, etc)
  const orders = await prisma.order.findMany({
    where: {
      status: { notIn: ['PENDING_PAYMENT', 'CANCELLED'] },
      ...(dateFrom || dateTo ? { updatedAt: where.createdAt } : {})
    },
    select: {
      serviceFee: true,
      fixedFee: true
    }
  });

  const serviceFeesTotal = orders.reduce((acc, order) => acc + Number(order.serviceFee) + Number(order.fixedFee), 0);

  // Serviços Extras
  const extraServices = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: {
      ...where,
      type: TransactionType.EXTRA_SERVICE
    }
  });

  // Armazenamento
  const storageFees = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: {
      ...where,
      type: TransactionType.STORAGE_FEE
    }
  });

  // Margem de Frete
  const shipments = await prisma.shipment.findMany({
    where: {
      status: { not: 'PREPARING' },
      ...(dateFrom || dateTo ? { updatedAt: where.createdAt } : {})
    },
    select: {
      shippingCostBrl: true,
      realShippingCostBrl: true
    }
  });

  const freightRevenue = shipments.reduce((acc, s) => acc + Number(s.shippingCostBrl), 0);
  const realFreightCost = shipments.reduce((acc, s) => acc + Number(s.realShippingCostBrl || 0), 0);
  const freightMargin = freightRevenue - realFreightCost;

  // 2. Custos (Costs)
  // Compras reais
  const purchasedOrders = await prisma.order.findMany({
    where: {
      status: { in: ['PURCHASED', 'IN_TRANSIT_TO_WAREHOUSE', 'IN_WAREHOUSE'] },
      ...(dateFrom || dateTo ? { updatedAt: where.createdAt } : {})
    },
    select: {
      realPriceJpy: true
    }
  });

  // Simplificação: usando cotação atual para relatório histórico se não tivermos a cotação da data
  // Em um sistema real, usaríamos a cotação salva na transação ou no registro do pedido.
  const config = await prisma.systemConfig.findUnique({ where: { id: 'CURRENT' } });
  const jpyRate = config?.jpyExchangeRate ? Number(config.jpyExchangeRate) : 0.035;

  const realPurchaseCostBrl = purchasedOrders.reduce((acc, order) => acc + (Number(order.realPriceJpy || 0) * jpyRate), 0);

  // Outros custos operacionais
  const operationalCosts = await prisma.operationalCost.findMany({
    where: {
      ...(dateFrom || dateTo ? { date: { gte: startOfDay(dateFrom!), lte: endOfDay(dateTo!) } } : {})
    }
  });
  const totalOperationalCosts = operationalCosts.reduce((acc, cost) => acc + Number(cost.amount), 0);

  const totalRevenue = serviceFeesTotal + Number(extraServices._sum.amount || 0) + Number(storageFees._sum.amount || 0) + freightMargin;
  const totalCosts = realFreightCost + realPurchaseCostBrl + totalOperationalCosts;
  const netProfit = totalRevenue - totalCosts;

  // 3. Dados para Gráficos
  // Receita por categoria
  const revenueByCategory = [
    { category: 'Taxas de Serviço', value: serviceFeesTotal },
    { category: 'Margem de Frete', value: freightMargin },
    { category: 'Serviços Extras', value: Number(extraServices._sum.amount || 0) },
    { category: 'Armazenamento', value: Number(storageFees._sum.amount || 0) }
  ];

  // Receita ao longo do tempo (últimos 30 dias se não houver filtro, ou o período do filtro)
  // Simplificado: agrupar por dia
  const timeData = await prisma.transaction.groupBy({
    by: ['createdAt'],
    _sum: { amount: true },
    where: {
      ...where,
      type: { in: [TransactionType.ORDER_PAYMENT, TransactionType.SHIPPING_PAYMENT, TransactionType.EXTRA_SERVICE, TransactionType.STORAGE_FEE] }
    },
    orderBy: { createdAt: 'asc' }
  });

  const revenueOverTime = timeData.map(item => ({
    date: format(item.createdAt, 'dd/MM'),
    value: Number(item._sum.amount || 0)
  }));

  // 4. Passivo (Saldos em carteira)
  const wallets = await prisma.wallet.findMany({
    include: { user: { select: { fullName: true } } }
  });
  const totalWalletBalance = wallets.reduce((acc, w) => acc + Number(w.balance), 0);
  const topWallets = [...wallets].sort((a, b) => Number(b.balance) - Number(a.balance)).slice(0, 10);

  return {
    revenue: {
      serviceFees: serviceFeesTotal,
      freightMargin,
      extraServices: Number(extraServices._sum.amount || 0),
      storageFees: Number(storageFees._sum.amount || 0),
      total: totalRevenue
    },
    costs: {
      realPurchases: realPurchaseCostBrl,
      realFreight: realFreightCost,
      operational: totalOperationalCosts,
      total: totalCosts
    },
    netProfit,
    charts: {
      revenueByCategory,
      revenueOverTime
    },
    liabilities: {
      totalWalletBalance,
      topWallets: topWallets.map(w => ({ name: w.user.fullName, balance: Number(w.balance) }))
    }
  };
}

export async function addOperationalCost(data: { description: string, amount: number, date: Date, category: string }) {
  return prisma.operationalCost.create({
    data: {
      ...data,
      amount: data.amount,
      date: startOfDay(data.date)
    }
  });
}
