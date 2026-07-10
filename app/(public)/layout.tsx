import MainHeader from '@/components/layout/main-header';
import { getMainHeaderUser } from '@/lib/auth/main-header-user';

export const experimental_ppr = true;

export default async function Layout({ children }: { children: React.ReactNode }) {
  const headerUser = await getMainHeaderUser();

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50 text-gray-800">
      <MainHeader user={headerUser} />
      <div className="relative flex-1">{children}</div>
    </div>
  );
}
