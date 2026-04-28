import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma/client';
import { WalletDashboard } from '@/components/wallet/WalletDashboard';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Minha Carteira | NipponBox',
  description: 'Gerencie seu saldo e veja seu histórico financeiro no NipponBox.',
};

export default async function WalletPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Buscar Carteira e Transações
  const wallet = await prisma.wallet.findUnique({
    where: { userId: user.id },
    include: {
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: 20
      }
    }
  });

  // Se por algum motivo não houver carteira (não deveria ocorrer se o cadastro funcionou)
  if (!wallet) {
    // Tenta criar uma carteira se não existir
    const newWallet = await prisma.wallet.create({
      data: { userId: user.id, balance: 0 }
    });
    return <WalletDashboard balance={0} transactions={[]} userId={user.id} />;
  }

  // Serializar transações para o componente client
  const serializedTransactions = wallet.transactions.map(tx => ({
    id: tx.id,
    type: tx.type,
    amount: Number(tx.amount),
    description: tx.description,
    createdAt: tx.createdAt.toISOString(),
  }));

  return (
    <WalletDashboard 
      balance={Number(wallet.balance)} 
      transactions={serializedTransactions} 
      userId={user.id}
    />
  );
}
