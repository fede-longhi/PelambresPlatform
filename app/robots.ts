import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin/', // Bloquea carpetas privadas si las tuvieras
    },
    sitemap: 'http://googleusercontent.com/pelambres3d.com.ar/sitemap.xml/2',
  };
}