import SideNav from "@/app/ui/print-guide/side-nav";
 
export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col md:flex-row md:overflow-hidden">
            <div className="w-full flex-none md:w-fit">
                <SideNav />
            </div>
            <div className="flexz-grow w-full p-6 md:overflow-y-auto md:p-12">
                {children}
            </div>
        </div>
    );
}