-- ==========================================
-- 3. CONFIGURAÇÃO DE RLS (ARMAZÉM E ENVIOS)
-- ==========================================

-- Habilitar RLS
ALTER TABLE "warehouse_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "extra_services" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "shipments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "shipment_items" ENABLE ROW LEVEL SECURITY;

-- Warehouse Items: usuários podem ver apenas seus próprios itens
DROP POLICY IF EXISTS "Users can view their own warehouse items" ON "warehouse_items";
CREATE POLICY "Users can view their own warehouse items" ON "warehouse_items"
FOR SELECT TO authenticated USING (auth.uid()::text = "userId");

-- Extra Services: usuários podem ver serviços de seus próprios itens
DROP POLICY IF EXISTS "Users can view their own extra services" ON "extra_services";
CREATE POLICY "Users can view their own extra services" ON "extra_services"
FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM "warehouse_items"
    WHERE "warehouse_items"."id" = "extra_services"."warehouseItemId"
    AND "warehouse_items"."userId" = auth.uid()::text
  )
);

-- Shipments: usuários podem ver apenas seus próprios envios
DROP POLICY IF EXISTS "Users can view their own shipments" ON "shipments";
CREATE POLICY "Users can view their own shipments" ON "shipments"
FOR SELECT TO authenticated USING (auth.uid()::text = "userId");

-- Shipment Items: usuários podem ver itens de seus próprios envios
DROP POLICY IF EXISTS "Users can view their own shipment items" ON "shipment_items";
CREATE POLICY "Users can view their own shipment items" ON "shipment_items"
FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM "shipments"
    WHERE "shipments"."id" = "shipment_items"."shipmentId"
    AND "shipments"."userId" = auth.uid()::text
  )
);

-- ADMIN: Pode tudo em tudo
DO $$
BEGIN
  -- Warehouse Items
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins manage all warehouse items') THEN
    CREATE POLICY "Admins manage all warehouse items" ON "warehouse_items" FOR ALL TO authenticated USING ((auth.jwt() ->> 'role') = 'ADMIN');
  END IF;
  
  -- Extra Services
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins manage all extra services') THEN
    CREATE POLICY "Admins manage all extra services" ON "extra_services" FOR ALL TO authenticated USING ((auth.jwt() ->> 'role') = 'ADMIN');
  END IF;
  
  -- Shipments
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins manage all shipments') THEN
    CREATE POLICY "Admins manage all shipments" ON "shipments" FOR ALL TO authenticated USING ((auth.jwt() ->> 'role') = 'ADMIN');
  END IF;
  
  -- Shipment Items
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins manage all shipment items') THEN
    CREATE POLICY "Admins manage all shipment items" ON "shipment_items" FOR ALL TO authenticated USING ((auth.jwt() ->> 'role') = 'ADMIN');
  END IF;
END $$;

-- Grants para API e Roles de Autenticação
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON "warehouse_items" TO authenticated, anon;
GRANT ALL ON "extra_services" TO authenticated, anon;
GRANT ALL ON "shipments" TO authenticated, anon;
GRANT ALL ON "shipment_items" TO authenticated, anon;
GRANT ALL ON "users" TO authenticated, anon;
GRANT ALL ON "addresses" TO authenticated, anon;
GRANT ALL ON "wallets" TO authenticated, anon;
GRANT ALL ON "orders" TO authenticated, anon;
GRANT ALL ON "transactions" TO authenticated, anon;
