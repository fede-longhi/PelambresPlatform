import type { Metadata } from 'next';
import PageHeader from '@/components/ui/page-header';
import { fetchFeatureFlags } from '@/lib/data/feature-flag-data';
import { FeatureFlagsList } from './_components/feature-flags-list';

export const metadata: Metadata = {
  title: 'Features',
};

export default async function Page() {
  const features = await fetchFeatureFlags();

  return (
    <div className="w-full">
      <PageHeader title="Features" className="mb-2" />
      <p className="mb-6 text-sm text-muted-foreground">
        Controlá qué módulos están visibles en el sitio público y quién puede
        verlos antes del lanzamiento general.
      </p>
      <FeatureFlagsList features={features} />
    </div>
  );
}
