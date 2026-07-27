import { getDeploymentDebugPanelData } from '@/lib/utils/deployment-env';
import { EnvDebugBadgeClient } from '@/components/shared/env-debug-badge-client';

/** Fixed corner badge — only renders outside real production. */
export function EnvDebugBadge() {
  const data = getDeploymentDebugPanelData();
  if (!data) {
    return null;
  }

  return <EnvDebugBadgeClient data={data} />;
}
