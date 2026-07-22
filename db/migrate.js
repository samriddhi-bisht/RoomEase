require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Pool } = require('pg');

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

// Migrations need a database to run against, but the database itself might
// not exist yet on a fresh machine. So we first connect to Postgres's
// built-in "postgres" maintenance database just to check/create ours.
async function ensureDatabaseExists() {
  const client = new Client({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    database: 'postgres',
  });
  await client.connect();
  const { rows } = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [DB_NAME]);
  if (rows.length === 0) {
    console.log(`Database "${DB_NAME}" not found — creating it.`);
    await client.query(`CREATE DATABASE "${DB_NAME}"`);
  }
  await client.end();
}

async function runMigrations() {
  await ensureDatabaseExists();

  const pool = new Pool({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  });

  // Tracks which migration files have already run, so this script is safe
  // to re-run any time (it only applies what's new).
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  const dir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    const { rows } = await pool.query('SELECT 1 FROM schema_migrations WHERE filename = $1', [file]);
    if (rows.length > 0) {
      console.log(`Skipping already-applied migration: ${file}`);
      continue;
    }

    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    const client = await pool.connect();
    try {
      // Each migration file runs as one atomic transaction: either every
      // statement in it succeeds, or none of them do.
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`Applied migration: ${file}`);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  await pool.end();
  console.log('All migrations applied.');
}

runMigrations().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
