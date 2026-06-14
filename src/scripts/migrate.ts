import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import fs from 'fs/promises';
import path from 'path';

async function migrate() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const rawSql = await fs.readFile(
    path.join(process.cwd(), 'drizzle', '0003_complete_schema.sql'),
    'utf-8',
  );

  const statements = rawSql
    .split('-- >>')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    try {
      await pool.query(stmt);
      const firstLine = stmt.split('\n')[0].trim().slice(0, 60);
      console.log(`✓ ${firstLine}...`);
    } catch (err: any) {
      const firstLine = stmt.split('\n')[0].trim().slice(0, 60);
      console.error(`✗ ${firstLine}...`);
      console.error(err.message);
    }
  }

  await pool.end();
  console.log('Migration complete.');
}

migrate().catch(console.error);
