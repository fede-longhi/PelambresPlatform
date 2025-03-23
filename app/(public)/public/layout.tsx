import PublicHeader from "@/app/ui/public-header";

export const experimental_ppr = true;
 
export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen">
            <div className="shadow-md sticky top-0">
                <PublicHeader />
            </div>
            <div className="flex-grow md:overflow-y-auto md:p-12 bg-slate-100">
                {children}
            </div>
        </div>
    );
}