import SideNav from '@/app/(admin)/admin/_components/sidenav';
import AdminScrollLock from '@/app/(admin)/admin/_components/admin-scroll-lock';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminScrollLock />
      <div className="fixed inset-0 flex w-full flex-col overflow-hidden bg-admin-canvas md:flex-row">
        <div className="flex-none md:h-full md:w-64">
          <SideNav />
        </div>
        <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden bg-admin-canvas">
          <div className="absolute inset-0 overflow-y-auto overscroll-y-contain p-4 md:p-12">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
