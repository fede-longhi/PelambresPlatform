import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
 
export const metadata: Metadata = {
    title: {
        template: '%s | Pelambres',
        default: 'Pelambres',
    },
    description: 'Servicio profesional de impresión 3D en Martínez, Buenos Aires. Especialistas en prototipado rápido, repuestos industriales y diseño personalizado FDM/SLA.',
    keywords: ['impresión 3d martínez', 'impresión 3d zona norte', 'prototipado rápido', 'piezas industriales 3d', 'pelambres 3d'],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${inter.className} antialiased`}>
                <main>
                    <TooltipProvider>
                        {children}
                    </TooltipProvider>
                </main>
                <Toaster />
            </body>
        </html>
    );
}