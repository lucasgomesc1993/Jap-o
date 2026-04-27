-- Create buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-photos', 'product-photos', false),
       ('warehouse-photos', 'warehouse-photos', false),
       ('ticket-attachments', 'ticket-attachments', false),
       ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Product Photos: Customer sees their own, Admin sees all
CREATE POLICY "Customers can view their own product photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'product-photos' AND (select auth.uid()) = owner);

CREATE POLICY "Admins can manage all product photos"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'product-photos' AND (select auth.jwt() ->> 'role') = 'ADMIN');

-- Warehouse Photos: Customer sees their own, Admin sees all
CREATE POLICY "Customers can view their own warehouse photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'warehouse-photos' AND (select auth.uid()) = owner);

CREATE POLICY "Admins can manage all warehouse photos"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'warehouse-photos' AND (select auth.jwt() ->> 'role') = 'ADMIN');

-- Ticket Attachments: Customer sees their own, Admin sees all
CREATE POLICY "Customers can view their own ticket attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'ticket-attachments' AND (select auth.uid()) = owner);

CREATE POLICY "Admins can manage all ticket attachments"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'ticket-attachments' AND (select auth.jwt() ->> 'role') = 'ADMIN');

-- Receipts: Only Admin can manage, Customer can view their own
CREATE POLICY "Admins can manage receipts"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'receipts' AND (select auth.jwt() ->> 'role') = 'ADMIN');
