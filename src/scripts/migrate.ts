import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import fs from 'fs/promises';
import path from 'path';

async function migrate() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const sql = await fs.readFile(
    path.join(process.cwd(), 'drizzle', '0003_complete_schema.sql'),
    'utf-8',
  );

  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--'));

  for (const stmt of statements) {
    try {
      await pool.query(stmt);
      console.log(`✓ Executed: ${stmt.slice(0, 80)}...`);
    } catch (err) {
      console.error(`✗ Failed: ${stmt.slice(0, 80)}...`);
      console.error(err);
    }
  }

  await pool.end();
  console.log('Migration complete.');
}

migrate().catch(console.error);
