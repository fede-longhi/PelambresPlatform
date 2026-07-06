import SideNav from '@/app/(admin)/admin/_components/sidenav'

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen w-full max-w-[100vw] flex-col overflow-x-hidden md:flex-row md:overflow-hidden">
            <div className="flex-none md:h-full md:w-64">
                <SideNav />
            </div>
            <div className="min-w-0 flex-1 overflow-y-auto p-4 md:p-12">{children}</div>
        </div>
    )
}