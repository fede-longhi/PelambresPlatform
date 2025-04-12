import SideNav from '@/app/ui/admin/sidenav'

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen w-screen flex-col md:flex-row md:overflow-hidden">
            <div className="w-full flex-none md:w-64">
                <SideNav />
            </div>
            <div className="flexz-grow w-full p-6 md:overflow-y-auto md:p-12">{children}</div>
        </div>
    )
}