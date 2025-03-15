import PublicHeader from "@/app/ui/public-header";

export const experimental_ppr = true;
 
export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col">
            <div className="shadow-md">
                <PublicHeader />
            </div>
            <div className="flex-grow p-6 md:overflow-y-auto md:p-12 bg-slate-100">
                {children}
            </div>
        </div>
    );
}