import SideNav from "@/app/ui/print-guide/side-nav";
 
export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col md:flex-row md:overflow-hidden w-full">
            {children}
        </div>
    );
}