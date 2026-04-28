-- ==========================================
-- 2. CONFIGURAÇÃO DE STORAGE (BUCKETS)
-- ==========================================

-- Criar buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-photos', 'product-photos', true),
       ('warehouse-photos', 'warehouse-photos', true),
       ('ticket-attachments', 'ticket-attachments', false),
       ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage
DROP POLICY IF EXISTS "Users can manage their own photos" ON storage.objects;
CREATE POLICY "Users can manage their own photos" ON storage.objects
FOR ALL TO authenticated USING (bucket_id IN ('product-photos', 'warehouse-photos', 'ticket-attachments') AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Admins can manage all photos" ON storage.objects;
CREATE POLICY "Admins can manage all photos" ON storage.objects
FOR ALL TO authenticated USING ((auth.jwt() ->> 'role') = 'ADMIN');

DROP POLICY IF EXISTS "Users can view their own receipts" ON storage.objects;
CREATE POLICY "Users can view their own receipts" ON storage.objects
FOR SELECT TO authenticated USING (bucket_id = 'receipts' AND (storage.foldername(name))[1] = auth.uid()::text);
