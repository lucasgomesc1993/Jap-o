-- Enable RLS
ALTER TABLE "tickets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ticket_messages" ENABLE ROW LEVEL SECURITY;

-- Tickets Policies
DROP POLICY IF EXISTS "Users can view their own tickets" ON "tickets";
CREATE POLICY "Users can view their own tickets"
ON "tickets" FOR SELECT
TO authenticated
USING (auth.uid()::text = "userId");

DROP POLICY IF EXISTS "Users can create their own tickets" ON "tickets";
CREATE POLICY "Users can create their own tickets"
ON "tickets" FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = "userId");

DROP POLICY IF EXISTS "Users can update their own tickets" ON "tickets";
CREATE POLICY "Users can update their own tickets"
ON "tickets" FOR UPDATE
TO authenticated
USING (auth.uid()::text = "userId");

DROP POLICY IF EXISTS "Admins can manage all tickets" ON "tickets";
CREATE POLICY "Admins can manage all tickets"
ON "tickets" FOR ALL
TO authenticated
USING ((auth.jwt() ->> 'role') = 'ADMIN');

-- Ticket Messages Policies
DROP POLICY IF EXISTS "Users can view messages of their tickets" ON "ticket_messages";
CREATE POLICY "Users can view messages of their tickets"
ON "ticket_messages" FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM "tickets"
  WHERE "tickets"."id" = "ticket_messages"."ticketId"
  AND "tickets"."userId" = auth.uid()::text
));

DROP POLICY IF EXISTS "Users can create messages in their tickets" ON "ticket_messages";
CREATE POLICY "Users can create messages in their tickets"
ON "ticket_messages" FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM "tickets"
  WHERE "tickets"."id" = "ticket_messages"."ticketId"
  AND "tickets"."userId" = auth.uid()::text
));

DROP POLICY IF EXISTS "Admins can manage all ticket messages" ON "ticket_messages";
CREATE POLICY "Admins can manage all ticket messages"
ON "ticket_messages" FOR ALL
TO authenticated
USING ((auth.jwt() ->> 'role') = 'ADMIN');
