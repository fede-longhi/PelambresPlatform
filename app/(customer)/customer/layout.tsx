import MainHeader from '@/components/layout/main-header';
import { getMainHeaderUser } from '@/lib/auth/main-header-user';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const headerUser = await getMainHeaderUser();

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50 text-gray-800">
      <MainHeader user={headerUser} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 md:py-12 lg:px-8">
        {children}
      </main>
    </div>
  );
}
