/**
 * Quick connection test — checks which URL is being used,
 * whether SET statement_timeout = 0 works, and how fast a 50-row insert is.
 */
import "dotenv/config";
import { Pool } from "pg";

const DIRECT = process.env.DIRECT_URL;
const POOL_URL = process.env.DATABASE_URL;

console.log("DIRECT_URL set:", !!DIRECT);
console.log("DATABASE_URL set:", !!POOL_URL);

const connStr = DIRECT || POOL_URL;
if (!connStr) { console.error("No connection string found"); process.exit(1); }

// Show which host we're connecting to (without password)
try {
  const u = new URL(connStr);
  console.log("Connecting to:", u.host, "port:", u.port || "default");
} catch {}

const pool = new Pool({ connectionString: connStr, max: 1 });

async function main() {
  const client = await pool.connect();
  try {
    // Test 1: SET statement_timeout = 0
    await client.query("SET statement_timeout = 0");
    const r = await client.query("SHOW statement_timeout");
    console.log("statement_timeout after SET:", r.rows[0].statement_timeout);

    // Test 2: Count existing IrsOrganization rows
    const t0 = Date.now();
    const count = await client.query('SELECT COUNT(*) FROM "IrsOrganization"');
    console.log("IrsOrganization rows in DB:", Number(count.rows[0].count).toLocaleString(), `(${Date.now()-t0}ms)`);

    // Test 3: Time a single 50-row INSERT ON CONFLICT DO NOTHING
    // Build 50 fake EINs that definitely won't exist
    const testRows = Array.from({ length: 50 }, (_, i) => ({
      ein: `TEST${String(i).padStart(5,'0')}`,
      name: `Test Org ${i}`,
    }));
    const values = testRows.map((_, i) => `($${i*2+1}, $${i*2+2})`).join(', ');
    const params = testRows.flatMap(r => [r.ein, r.name]);

    const t1 = Date.now();
    await client.query(
      `INSERT INTO "IrsOrganization" (id, ein, name, "bmfLastUpdated") SELECT gen_random_uuid(), ein, name, NOW() FROM (VALUES ${values}) AS v(ein,name) ON CONFLICT DO NOTHING`,
      params
    );
    console.log("50-row insert time:", Date.now()-t1, "ms");

    // Clean up test rows
    await client.query(`DELETE FROM "IrsOrganization" WHERE ein LIKE 'TEST%'`);
    console.log("Test rows cleaned up. Connection is working correctly.");

  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(e => { console.error("ERROR:", e.message); process.exit(1); });
