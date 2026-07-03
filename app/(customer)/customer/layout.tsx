import CustomerSideNav from '@/app/(customer)/customer/_components/sidenav';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <CustomerSideNav />
      </div>
      <div className="w-full grow p-6 md:overflow-y-auto md:p-12">{children}</div>
    </div>
  );
}
