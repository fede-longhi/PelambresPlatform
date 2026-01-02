import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://pelambres.com.ar';

  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/print-guide`, lastModified: new Date() },
    { url: `${baseUrl}/print-guide/slicing`, lastModified: new Date() },
    { url: `${baseUrl}/print-guide/tolerances`, lastModified: new Date() },
    { url: `${baseUrl}/print-status`, lastModified: new Date() },
    { url: `${baseUrl}/quote-request`, lastModified: new Date() },
    { url: `${baseUrl}/tools`, lastModified: new Date() },
  ];
}