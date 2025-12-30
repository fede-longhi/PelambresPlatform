import SideNav from "@/app/ui/print-guide/side-nav";
 
export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col md:flex-row md:overflow-hidden">
            <div className="w-full flex-none md:w-fit">
                <SideNav />
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="my-12 text-center">
                    <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">
                        Guía de Impresión y Diseño 3D
                    </h1>
                    <p className="mt-2 text-xl text-muted-foreground">
                        Recursos esenciales para optimizar tu proyecto antes de cotizar.
                    </p>
                </div>

                <div className="flexz-grow w-full p-6 md:overflow-y-auto md:p-12">
                    {children}
                </div>
            </div>
        </div>
    );
}