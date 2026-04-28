import { Client } from 'pg';

async function testConnection(url: string, label: string) {
  console.log(`Testando ${label}...`);
  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    console.log(`✅ Sucesso: ${label}`);
    await client.end();
  } catch (err) {
    console.error(`❌ Falha: ${label}`);
    console.error(err);
  }
}

const dbUrlPooler = "postgresql://postgres:fDLFH9QGbKxLsLKX@db.wbwblbalchnuqhsiylnx.supabase.co:6543/postgres?pgbouncer=true";
const dbUrlDirect = "postgresql://postgres:fDLFH9QGbKxLsLKX@db.wbwblbalchnuqhsiylnx.supabase.co:5432/postgres";
const dbUrlPoolerNew = "postgresql://postgres:fDLFH9QGbKxLsLKX@wbwblbalchnuqhsiylnx.pooler.supabase.com:6543/postgres?pgbouncer=true";

async function run() {
  await testConnection(dbUrlPooler, "Pooler Antigo (db.ref)");
  await testConnection(dbUrlDirect, "Direto (db.ref)");
  await testConnection(dbUrlPoolerNew, "Pooler Novo (.pooler.supabase.com)");
}

run();
