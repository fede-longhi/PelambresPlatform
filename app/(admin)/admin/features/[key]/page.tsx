import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import PageHeader from '@/components/ui/page-header';
import { isFeatureKey } from '@/lib/consts/feature-flag-consts';
import {
  fetchFeatureFlagAllowlist,
  fetchFeatureFlagByKey,
} from '@/lib/data/feature-flag-data';
import { FeatureAllowlistManager } from '../_components/feature-allowlist-manager';
import { FeatureVisibilityToggle } from '../_components/feature-visibility-toggle';

type FeatureDetailPageProps = {
  params: Promise<{ key: string }>;
};

export async function generateMetadata({
  params,
}: FeatureDetailPageProps): Promise<Metadata> {
  const { key } = await params;
  const flag = await fetchFeatureFlagByKey(key);
  return { title: flag ? `Feature: ${flag.label}` : 'Feature' };
}

export default async function Page({ params }: FeatureDetailPageProps) {
  const { key } = await params;

  if (!isFeatureKey(key)) {
    notFound();
  }

  const flag = await fetchFeatureFlagByKey(key);
  if (!flag) {
    notFound();
  }

  const allowlist = await fetchFeatureFlagAllowlist(key);

  return (
    <div className="w-full space-y-6">
      <div>
        <Link
          href="/admin/features"
          className="mb-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Volver a features
        </Link>
        <PageHeader title={flag.label} className="mb-2" />
        {flag.description ? (
          <p className="text-sm text-muted-foreground">{flag.description}</p>
        ) : null}
      </div>

      <FeatureVisibilityToggle
        featureKey={flag.key}
        isEnabled={flag.isEnabled}
      />

      <FeatureAllowlistManager featureKey={flag.key} users={allowlist} />
    </div>
  );
}
