/**
 * Queries and drops the GIN trigram index on IrsOrganization.name
 * before the bulk import, to avoid statement_timeout from index maintenance.
 *
 * Run with: npx tsx prisma/drop-gin-index.ts
 */

import "dotenv/config";
import { Pool } from "pg";

const CONNECTION_STRING = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!CONNECTION_STRING) { console.error("DATABASE_URL is required"); process.exit(1); }

const pool = new Pool({ connectionString: CONNECTION_STRING, max: 1 });

async function main() {
  const client = await pool.connect();
  try {
    // List all indexes on IrsOrganization
    const { rows } = await client.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'IrsOrganization'
      ORDER BY indexname
    `);

    console.log("\nIndexes on IrsOrganization:");
    for (const row of rows) {
      console.log(`  ${row.indexname}`);
      console.log(`    ${row.indexdef}`);
    }

    // Find GIN index (trigram or any gin type)
    const ginIndexes = rows.filter(r =>
      r.indexdef?.toLowerCase().includes("gin")
    );

    if (ginIndexes.length === 0) {
      console.log("\nNo GIN indexes found — nothing to drop.");
      return;
    }

    for (const idx of ginIndexes) {
      console.log(`\nDropping GIN index: ${idx.indexname}`);
      await client.query(`DROP INDEX IF EXISTS "${idx.indexname}"`);
      console.log(`  Dropped: ${idx.indexname}`);
    }

    console.log("\nDone. GIN index(es) dropped. Safe to run bulk import now.");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(e => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
