import { config as loadEnvFile } from 'dotenv';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import postgres from 'postgres';

const MIGRATIONS_DIR = path.join(process.cwd(), 'sql', 'migrations');

/**
 * Neon branch targets. These are explicit env vars — not the same as
 * POSTGRES_URL, which varies by environment (local → developer, Vercel → main).
 */
const TARGET_ENV_VARS: Record<string, string | string[]> = {
  /** Uses POSTGRES_URL — whatever the current environment points to. */
  default: 'POSTGRES_URL',
  /** Neon main branch (production). Set POSTGRES_URL_MAIN in local .env to migrate prod from your machine. */
  main: 'POSTGRES_URL_MAIN',
  /** Neon developer branch. Falls back to POSTGRES_URL if POSTGRES_URL_DEV is unset. */
  dev: ['POSTGRES_URL_DEV', 'POSTGRES_URL'],
  developer: ['POSTGRES_URL_DEV', 'POSTGRES_URL'],
};

type CliOptions = {
  target: string;
  envFile?: string;
  statusOnly: boolean;
};

function parseCliOptions(): CliOptions {
  const args = process.argv.slice(2);
  let target = 'default';
  let envFile: string | undefined;

  for (const arg of args) {
    if (arg === '--status') {
      continue;
    }

    if (arg.startsWith('--target=')) {
      target = arg.slice('--target='.length);
      continue;
    }

    // Backwards-compatible alias
    if (arg.startsWith('--branch=')) {
      target = arg.slice('--branch='.length);
      continue;
    }

    if (arg.startsWith('--env-file=')) {
      envFile = arg.slice('--env-file='.length);
    }
  }

  return {
    target,
    envFile,
    statusOnly: args.includes('--status'),
  };
}

function loadEnvironment(options: CliOptions) {
  loadEnvFile({ path: path.join(process.cwd(), '.env') });

  if (options.envFile) {
    loadEnvFile({
      path: path.resolve(process.cwd(), options.envFile),
      override: true,
    });
  }
}

function resolvePostgresUrl(target: string): { url: string; envVarName: string } {
  const envVarConfig = TARGET_ENV_VARS[target];

  if (!envVarConfig) {
    const supportedTargets = Object.keys(TARGET_ENV_VARS).join(', ');
    console.error(`Unknown target "${target}". Supported targets: ${supportedTargets}`);
    process.exit(1);
  }

  const envVarNames = Array.isArray(envVarConfig) ? envVarConfig : [envVarConfig];

  for (const envVarName of envVarNames) {
    const postgresUrl = process.env[envVarName];
    if (postgresUrl) {
      return { url: postgresUrl, envVarName };
    }
  }

  console.error(`No connection string found for target "${target}".`);
  console.error(`Set one of: ${envVarNames.join(', ')}`);
  process.exit(1);
}

function describeTarget(
  postgresUrl: string,
  target: string,
  envVarName: string
): string {
  try {
    const url = new URL(postgresUrl);
    const host = url.hostname;
    const database = url.pathname.replace(/^\//, '') || '(default)';
    return `${target} (${envVarName} → ${host}/${database})`;
  } catch {
    return `${target} (${envVarName})`;
  }
}

function checksum(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function getMigrationFiles(): string[] {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    return [];
  }

  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((filename) => filename.endsWith('.sql'))
    .sort();
}

async function ensureMigrationsTable(sql: postgres.Sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT NOT NULL UNIQUE,
      checksum TEXT NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

async function getAppliedMigrations(sql: postgres.Sql) {
  const rows = await sql<{ filename: string; checksum: string }[]>`
    SELECT filename, checksum
    FROM schema_migrations
    ORDER BY filename
  `;

  return new Map(rows.map((row) => [row.filename, row.checksum]));
}

async function runMigrations() {
  const options = parseCliOptions();
  loadEnvironment(options);

  const { url: postgresUrl, envVarName } = resolvePostgresUrl(options.target);
  const targetDescription = describeTarget(postgresUrl, options.target, envVarName);

  console.log(`Target: ${targetDescription}`);

  const sql = postgres(postgresUrl, { ssl: 'require', max: 1 });

  try {
    await ensureMigrationsTable(sql);

    const appliedMigrations = await getAppliedMigrations(sql);
    const migrationFiles = getMigrationFiles();

    if (migrationFiles.length === 0) {
      console.log('No migration files found in sql/migrations/.');
      return;
    }

    let pendingCount = 0;

    for (const filename of migrationFiles) {
      const filePath = path.join(MIGRATIONS_DIR, filename);
      const content = fs.readFileSync(filePath, 'utf8');
      const fileChecksum = checksum(content);
      const appliedChecksum = appliedMigrations.get(filename);

      if (appliedChecksum) {
        if (appliedChecksum !== fileChecksum) {
          console.warn(`⚠ ${filename} was modified after it was applied.`);
        } else {
          console.log(`✓ ${filename}`);
        }
        continue;
      }

      pendingCount += 1;

      if (options.statusOnly) {
        console.log(`… ${filename} (pending)`);
        continue;
      }

      console.log(`→ applying ${filename}`);

      await sql.begin(async (transaction) => {
        await transaction.unsafe(content);
        await transaction`
          INSERT INTO schema_migrations (filename, checksum)
          VALUES (${filename}, ${fileChecksum})
        `;
      });

      console.log(`✓ applied ${filename}`);
    }

    if (options.statusOnly) {
      console.log(
        pendingCount === 0
          ? 'All migrations are applied.'
          : `${pendingCount} migration(s) pending. Run pnpm db:migrate to apply them.`
      );
      return;
    }

    if (pendingCount === 0) {
      console.log('Database is up to date.');
      return;
    }

    console.log(`Applied ${pendingCount} migration(s).`);
  } finally {
    await sql.end();
  }
}

runMigrations().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
