function isMercadoPagoSandboxEnabled() {
  const sandboxFlag = process.env.MERCADOPAGO_SANDBOX?.trim().toLowerCase();
  if (sandboxFlag === 'true' || sandboxFlag === '1') {
    return true;
  }
  if (sandboxFlag === 'false' || sandboxFlag === '0') {
    return false;
  }

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN ?? '';
  if (accessToken.startsWith('TEST-')) {
    return true;
  }

  return process.env.NODE_ENV !== 'production';
}

function isNonProductionEnvironment() {
  const vercelEnv = process.env.VERCEL_ENV;
  const isMarkedProduction = process.env.IS_PRODUCTION === 'true';
  return !(vercelEnv === 'production' || isMarkedProduction);
}

/** Safe DB connection summary — never includes password or full URL. */
export function getDatabaseDebugInfo() {
  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) {
    return {
      configured: false as const,
      source: null,
      host: null,
      database: null,
      user: null,
      port: null,
      isNeon: false,
      neonEndpoint: null,
      hasDevUrl: Boolean(process.env.POSTGRES_URL_DEV),
      hasMainUrl: Boolean(process.env.POSTGRES_URL_MAIN),
    };
  }

  try {
    const normalized = connectionString.replace(/^postgres(ql)?:/i, 'https:');
    const url = new URL(normalized);
    const host = url.hostname || null;
    const isNeon = Boolean(host?.includes('neon.tech'));
    const neonEndpoint = isNeon
      ? host?.split('.')[0]?.replace(/-pooler$/, '') || null
      : null;

    return {
      configured: true as const,
      source: 'POSTGRES_URL',
      host,
      database: url.pathname.replace(/^\//, '') || null,
      user: url.username || null,
      port: url.port || null,
      isNeon,
      neonEndpoint,
      hasDevUrl: Boolean(process.env.POSTGRES_URL_DEV),
      hasMainUrl: Boolean(process.env.POSTGRES_URL_MAIN),
    };
  } catch {
    return {
      configured: false as const,
      source: 'POSTGRES_URL',
      host: null,
      database: null,
      user: null,
      port: null,
      isNeon: false,
      neonEndpoint: null,
      hasDevUrl: Boolean(process.env.POSTGRES_URL_DEV),
      hasMainUrl: Boolean(process.env.POSTGRES_URL_MAIN),
      parseError: true as const,
    };
  }
}

export type DeploymentDebugField = {
  label: string;
  value: string;
};

export type DeploymentDebugPanelData = {
  badgeLabel: string;
  environment: DeploymentDebugField[];
  mercadoPago: DeploymentDebugField[];
  database: DeploymentDebugField[];
};

/**
 * Visible debug identity for non-production deploys.
 * Never shown in production (VERCEL_ENV=production or IS_PRODUCTION=true).
 */
export function getDeploymentDebugPanelData(): DeploymentDebugPanelData | null {
  if (!isNonProductionEnvironment()) {
    return null;
  }

  const vercelEnv = process.env.VERCEL_ENV;
  const branch = process.env.VERCEL_GIT_COMMIT_REF?.trim() || null;
  const mpSandbox = isMercadoPagoSandboxEnabled();
  const deployPart =
    !vercelEnv || vercelEnv === 'development' ? 'local' : vercelEnv;

  const badgeParts: string[] = [deployPart];
  if (branch && branch !== deployPart) {
    badgeParts.push(branch);
  }
  if (mpSandbox) {
    badgeParts.push('mp-sandbox');
  }

  const db = getDatabaseDebugInfo();

  return {
    badgeLabel: badgeParts.join(' · '),
    environment: [
      { label: 'Deploy', value: deployPart },
      { label: 'VERCEL_ENV', value: vercelEnv || '(none — local)' },
      { label: 'Git branch', value: branch || '—' },
      { label: 'NODE_ENV', value: process.env.NODE_ENV || '—' },
      {
        label: 'IS_PRODUCTION',
        value: process.env.IS_PRODUCTION === 'true' ? 'true' : 'false',
      },
      {
        label: 'App URL',
        value:
          process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
          (process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : '—'),
      },
    ],
    mercadoPago: [
      {
        label: 'Sandbox',
        value: mpSandbox ? 'yes' : 'no',
      },
      {
        label: 'MERCADOPAGO_SANDBOX',
        value: process.env.MERCADOPAGO_SANDBOX?.trim() || '(unset)',
      },
      {
        label: 'Access token',
        value: process.env.MERCADOPAGO_ACCESS_TOKEN
          ? process.env.MERCADOPAGO_ACCESS_TOKEN.startsWith('TEST-')
            ? 'TEST-…'
            : process.env.MERCADOPAGO_ACCESS_TOKEN.startsWith('APP_USR-')
              ? 'APP_USR-…'
              : '(set)'
          : '(missing)',
      },
      {
        label: 'Webhook secret',
        value: process.env.MERCADOPAGO_WEBHOOK_SECRET ? '(set)' : '(missing)',
      },
    ],
    database: [
      {
        label: 'Configured',
        value: db.configured ? 'yes' : 'no',
      },
      {
        label: 'Source',
        value: db.source || '—',
      },
      {
        label: 'Host',
        value: db.host || '—',
      },
      {
        label: 'Database',
        value: db.database || '—',
      },
      {
        label: 'User',
        value: db.user || '—',
      },
      {
        label: 'Port',
        value: db.port || '—',
      },
      {
        label: 'Neon',
        value: db.isNeon
          ? db.neonEndpoint
            ? `yes (${db.neonEndpoint})`
            : 'yes'
          : 'no',
      },
      {
        label: 'POSTGRES_URL_DEV',
        value: db.hasDevUrl ? 'set' : 'unset',
      },
      {
        label: 'POSTGRES_URL_MAIN',
        value: db.hasMainUrl ? 'set' : 'unset',
      },
      ...('parseError' in db && db.parseError
        ? [{ label: 'Parse', value: 'failed (invalid URL)' }]
        : []),
    ],
  };
}
