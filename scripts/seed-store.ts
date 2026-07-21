import { config as loadEnvFile } from 'dotenv';
import fs from 'fs';
import path from 'path';
import postgres from 'postgres';

loadEnvFile({ path: path.join(process.cwd(), '.env') });

const SEED_FILE = path.join(
  process.cwd(),
  'sql',
  'seeds',
  '001_store_demo_catalog.sql'
);

async function main() {
  const connectionString = process.env.POSTGRES_URL_DEV || process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error('Missing POSTGRES_URL_DEV or POSTGRES_URL in .env');
    process.exit(1);
  }

  if (!fs.existsSync(SEED_FILE)) {
    console.error(`Seed file not found: ${SEED_FILE}`);
    process.exit(1);
  }

  const sqlText = fs.readFileSync(SEED_FILE, 'utf8');
  const sql = postgres(connectionString, { ssl: 'require', max: 1 });

  try {
    await sql.unsafe(sqlText);
    console.log('Store demo catalog seed applied.');
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
