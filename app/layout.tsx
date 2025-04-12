import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
 
export const metadata: Metadata = {
    title: {
        template: '%s | Pelambres',
        default: 'Pelambres',
    },
    description: 'Pelambres - Servicio de Impresión 3d.',
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
                    {children}
                </main>
                <Toaster />
            </body>
        </html>
    );
}