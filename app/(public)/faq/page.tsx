import Script from 'next/script';
import type { Metadata } from 'next';
import { FaqSection } from '@/components/shared/faq-section';
import { SITE_FAQS } from '@/lib/consts/faq-consts';

export const metadata: Metadata = {
  title: 'Preguntas frecuentes',
  description:
    'Respuestas sobre impresión 3D: archivos, materiales, plazos, precisión y presupuestos en Pelambres 3D.',
};

export default function FaqPage() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: SITE_FAQS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
        <FaqSection titleAs="h1" />
      </div>
    </div>
  );
}
