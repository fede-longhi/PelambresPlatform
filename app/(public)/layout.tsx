import MainHeader from '@/components/layout/main-header';
import { StoreCartProvider } from '@/components/store/store-cart-provider';
import { getAccessibleFeatureKeysForSession } from '@/lib/auth/feature-access';
import { getMainHeaderUser } from '@/lib/auth/main-header-user';

export const experimental_ppr = true;

export default async function Layout({ children }: { children: React.ReactNode }) {
  const [headerUser, accessibleFeatures] = await Promise.all([
    getMainHeaderUser(),
    getAccessibleFeatureKeysForSession(),
  ]);

  return (
    <StoreCartProvider>
      <div className="flex min-h-screen w-full flex-col bg-gray-50 text-gray-800">
        <MainHeader user={headerUser} accessibleFeatures={accessibleFeatures} />
        <div className="relative flex-1">{children}</div>
      </div>
    </StoreCartProvider>
  );
}
