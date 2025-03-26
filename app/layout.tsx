import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import { Metadata } from 'next';
 
export const metadata: Metadata = {
  title: {
    template: '%s | Pelambres',
    default: 'Pelambres',
  },
  description: 'Pelambres - Servicio de Impresión 3d.',
  metadataBase: new URL('https://www.pelambres.com.ar/images/pelambres_preview.png'),
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}