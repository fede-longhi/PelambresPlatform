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

export type DeploymentDebugInfo = {
  label: string;
  parts: string[];
};

/**
 * Visible debug identity for non-production deploys.
 * Returns null on real production (unless MP sandbox is forced on).
 */
export function getDeploymentDebugInfo(): DeploymentDebugInfo | null {
  const vercelEnv = process.env.VERCEL_ENV; // production | preview | development
  const branch = process.env.VERCEL_GIT_COMMIT_REF?.trim() || null;
  const isMarkedProduction = process.env.IS_PRODUCTION === 'true';
  const mpSandbox = isMercadoPagoSandboxEnabled();

  const isRealProduction =
    vercelEnv === 'production' && isMarkedProduction && !mpSandbox;

  if (isRealProduction) {
    return null;
  }

  // Local `next dev` has no VERCEL_ENV.
  const deployPart =
    !vercelEnv || vercelEnv === 'development' ? 'local' : vercelEnv;

  const parts: string[] = [deployPart];

  if (branch && branch !== deployPart) {
    parts.push(branch);
  }

  if (mpSandbox) {
    parts.push('mp-sandbox');
  }

  return {
    parts,
    label: parts.join(' · '),
  };
}
