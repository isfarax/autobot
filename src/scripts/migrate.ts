import 'dotenv/config';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const sql = fs.readFileSync(path.join(__dirname, '../../drizzle/0001_curly_forgotten_one.sql'), 'utf-8');
  const statements = sql.split('--> statement-breakpoint').map((s) => s.trim()).filter(Boolean);
  for (const stmt of statements) {
    console.log(`Executing: ${stmt.slice(0, 80)}...`);
    await pool.query(stmt);
  }
  console.log('Migration complete');
  await pool.end();
}

main().catch((err) => { console.error(err); process.exit(1); });
