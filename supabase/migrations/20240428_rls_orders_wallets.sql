-- Enable RLS
ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "exchange_rates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "wallets" ENABLE ROW LEVEL SECURITY;

-- Orders Policies
DROP POLICY IF EXISTS "Users can view their own orders" ON "orders";
CREATE POLICY "Users can view their own orders"
ON "orders" FOR SELECT
TO authenticated
USING (auth.uid()::text = "userId");

DROP POLICY IF EXISTS "Users can create their own orders" ON "orders";
CREATE POLICY "Users can create their own orders"
ON "orders" FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = "userId");

DROP POLICY IF EXISTS "Admins can manage all orders" ON "orders";
CREATE POLICY "Admins can manage all orders"
ON "orders" FOR ALL
TO authenticated
USING ((auth.jwt() ->> 'role') = 'ADMIN');

-- Transactions Policies
DROP POLICY IF EXISTS "Users can view their own transactions" ON "transactions";
CREATE POLICY "Users can view their own transactions"
ON "transactions" FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM "wallets"
  WHERE "wallets"."id" = "transactions"."walletId"
  AND "wallets"."userId" = auth.uid()::text
));

DROP POLICY IF EXISTS "Admins can manage all transactions" ON "transactions";
CREATE POLICY "Admins can manage all transactions"
ON "transactions" FOR ALL
TO authenticated
USING ((auth.jwt() ->> 'role') = 'ADMIN');

-- Wallets Policies
DROP POLICY IF EXISTS "Users can view their own wallet" ON "wallets";
CREATE POLICY "Users can view their own wallet"
ON "wallets" FOR SELECT
TO authenticated
USING (auth.uid()::text = "userId");

DROP POLICY IF EXISTS "Admins can manage all wallets" ON "wallets";
CREATE POLICY "Admins can manage all wallets"
ON "wallets" FOR ALL
TO authenticated
USING ((auth.jwt() ->> 'role') = 'ADMIN');

-- Exchange Rates Policies
DROP POLICY IF EXISTS "Everyone can view exchange rates" ON "exchange_rates";
CREATE POLICY "Everyone can view exchange rates"
ON "exchange_rates" FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Only admins can manage exchange rates" ON "exchange_rates";
CREATE POLICY "Only admins can manage exchange rates"
ON "exchange_rates" FOR ALL
TO authenticated
USING ((auth.jwt() ->> 'role') = 'ADMIN');
