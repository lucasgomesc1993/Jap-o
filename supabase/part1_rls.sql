-- ==========================================
-- 1. CONFIGURAÇÃO DE RLS (TABELAS PÚBLICAS)
-- ==========================================

-- Habilitar RLS
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "addresses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "exchange_rates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "wallets" ENABLE ROW LEVEL SECURITY;

-- Usuários: podem ver apenas seu próprio perfil
DROP POLICY IF EXISTS "Users can view their own profile" ON "users";
CREATE POLICY "Users can view their own profile" ON "users"
FOR SELECT TO authenticated USING (auth.uid()::text = id);

-- Endereços: podem gerenciar apenas seus próprios endereços
DROP POLICY IF EXISTS "Users can manage their own addresses" ON "addresses";
CREATE POLICY "Users can manage their own addresses" ON "addresses"
FOR ALL TO authenticated USING (auth.uid()::text = "userId");

-- Pedidos: podem gerenciar apenas seus próprios pedidos
DROP POLICY IF EXISTS "Users can manage their own orders" ON "orders";
CREATE POLICY "Users can manage their own orders" ON "orders"
FOR ALL TO authenticated USING (auth.uid()::text = "userId");

-- Carteiras: podem ver apenas sua própria carteira
DROP POLICY IF EXISTS "Users can view their own wallet" ON "wallets";
CREATE POLICY "Users can view their own wallet" ON "wallets"
FOR SELECT TO authenticated USING (auth.uid()::text = "userId");

-- Transações: podem ver apenas suas próprias transações
DROP POLICY IF EXISTS "Users can view their own transactions" ON "transactions";
CREATE POLICY "Users can view their own transactions" ON "transactions"
FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM "wallets"
    WHERE "wallets"."id" = "transactions"."walletId"
    AND "wallets"."userId" = auth.uid()::text
  )
);

-- Cotações: todos autenticados podem ver
DROP POLICY IF EXISTS "Everyone can view exchange rates" ON "exchange_rates";
CREATE POLICY "Everyone can view exchange rates" ON "exchange_rates"
FOR SELECT TO authenticated USING (true);

-- ADMIN: Pode tudo em tudo
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins manage all users') THEN
    CREATE POLICY "Admins manage all users" ON "users" FOR ALL TO authenticated USING ((auth.jwt() ->> 'role') = 'ADMIN');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins manage all orders') THEN
    CREATE POLICY "Admins manage all orders" ON "orders" FOR ALL TO authenticated USING ((auth.jwt() ->> 'role') = 'ADMIN');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins manage all wallets') THEN
    CREATE POLICY "Admins manage all wallets" ON "wallets" FOR ALL TO authenticated USING ((auth.jwt() ->> 'role') = 'ADMIN');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins manage all transactions') THEN
    CREATE POLICY "Admins manage all transactions" ON "transactions" FOR ALL TO authenticated USING ((auth.jwt() ->> 'role') = 'ADMIN');
  END IF;
END $$;
