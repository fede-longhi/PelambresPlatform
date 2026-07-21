import { notFound } from 'next/navigation';
import { sessionCanAccessFeature } from '@/lib/auth/feature-access';

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const canAccess = await sessionCanAccessFeature('store');
  if (!canAccess) {
    notFound();
  }

  return children;
}
