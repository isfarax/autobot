import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
try {
  const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
  console.log('Tables:', res.rows.map(r => r.table_name));

  for (const table of res.rows.map(r => r.table_name)) {
    const cols = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name='${table}'`);
    console.log(`  ${table}:`, cols.rows.map(c => c.column_name));
  }
} finally {
  await pool.end();
}
