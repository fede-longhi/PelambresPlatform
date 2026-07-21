import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import Form from "@/app/(public)/quote-request/_components/quote-form";
import { Package, DraftingCompass, Slice, PencilRuler } from "lucide-react"; 
import { GoogleReviews } from '@/components/google-reviews/google-reviews';
import MainHeader from '@/components/layout/main-header';
import MainFooter from '@/components/layout/main-footer';
import { getAccessibleFeatureKeysForSession } from '@/lib/auth/feature-access';
import { getMainHeaderUser } from '@/lib/auth/main-header-user';

const sectionHeadingClassName =
    'text-3xl font-extrabold text-center text-heading-foreground sm:text-4xl';

export default async function Page() {
    const [headerUser, accessibleFeatures] = await Promise.all([
        getMainHeaderUser(),
        getAccessibleFeatureKeysForSession(),
    ]);
    const localBusinessJsonLd = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "Pelambres 3D",
        "image": "https://pelambres.com.ar/images/pelambres_ia_02.jpg",
        "description": "Servicio de impresión 3D profesional y diseño industrial en Martínez.",
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Martínez",
            "addressRegion": "Buenos Aires",
            "addressCountry": "AR"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": -34.4929125,
            "longitude": -58.5192373
        },
        "url": "https://pelambres.com.ar",
        "telephone": "+541158928659"
    };

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted text-foreground">
            <Script
                id="local-business-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
            />
            <MainHeader user={headerUser} accessibleFeatures={accessibleFeatures} />

            <main className="space-y-20">
                <section className="relative bg-background pt-12 sm:pt-16 lg:pt-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
                            <div className="relative z-10 lg:py-12">
                                <h1 className="text-4xl font-extrabold text-heading-foreground sm:text-5xl lg:text-6xl">
                                    Servicio de Impresión 3D <span className="text-primary">Profesional</span>
                                </h1>
                                <p className="mt-4 text-xl text-muted-foreground">
                                    Ofrecemos servicios de prototipado rápido, fabricación de piezas y diseño personalizado con la más alta precisión.
                                </p>
                                <div className="mt-8 sm:mt-10 sm:flex sm:gap-4">
                                    <Link
                                        href='/quote-request'
                                        className="mb-4 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow-lg transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:mb-0"
                                    >
                                        <PencilRuler className="mr-2 h-5 w-5" aria-hidden="true" /> 
                                        Solicitar un presupuesto
                                    </Link>
                                </div>
                            </div>

                            <div className="my-12 lg:mt-0">
                                <div className="aspect-video w-full overflow-hidden rounded-xl shadow-lg">
                                    <Image
                                        src="/images/pelambres_ia_02.jpg"
                                        alt="Una impresora 3D en funcionamiento"
                                        className="h-full w-full rounded-xl object-cover" 
                                        width={1600}
                                        height={900}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="proyectos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className={sectionHeadingClassName}>Nuestros Proyectos</h2>
                    <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
                        Mirá algunos de los trabajos que hicimos. Desde prototipos industriales hasta figuras artísticas, todo es posible.
                    </p>
                    <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        <div className="overflow-hidden rounded-xl bg-background shadow-lg transition-transform duration-300 hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none">
                            <Image
                                src="/images/pieza_automotriz.png"
                                alt="Repuesto automotriz fabricado con impresión 3D de alta resistencia"
                                width={1024}
                                height={1024}
                                className="h-56 w-full object-cover" />

                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-heading-foreground">Repuesto Automotriz</h3>
                                <p className="mt-2 text-sm text-muted-foreground">Repuestos especiales para vehículos que no se consiguen en el mercado, fabricados con precisión y materiales de alta calidad.</p>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-xl bg-background shadow-lg transition-transform duration-300 hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none">
                            <Image
                                src="/images/pieza_industrial.png"
                                alt="Pieza mecánica industrial impresa en 3D para maquinaria"
                                width={1024}
                                height={1024}
                                className="h-56 object-cover" />
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-heading-foreground">Pieza Industrial</h3>
                                <p className="mt-2 text-sm text-muted-foreground">Piezas industriales, optimizadas para mayor resistencia y menor peso.</p>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-xl bg-background shadow-lg transition-transform duration-300 hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none">
                            <Image
                                src="/images/baby_groot_w.png"
                                alt="Figura de colección Baby Groot impresa en 3D con acabado artístico"
                                width={1024}
                                height={768}
                                className="h-56 object-cover" />
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-heading-foreground">Figura de Colección</h3>
                                <p className="mt-2 text-sm text-muted-foreground">Figuras personalizadas, trabajadas a mano para un acabado único.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="servicios" className="bg-background py-16 sm:py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className={sectionHeadingClassName}>Nuestros Servicios</h2>
                        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
                            Ofrecemos una gama de servicios para cubrir todas tus necesidades de fabricación.
                        </p>
                        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
                            <div className="rounded-xl bg-muted p-6 text-center shadow-md">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                                    <DraftingCompass className="text-primary" size={32} strokeWidth={2} aria-hidden="true"/>
                                </div>
                                <h3 className="text-xl font-semibold text-heading-foreground">Diseño y Modelado 3D</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    ¿No tenés un archivo 3D? Te ayudamos a crear el modelo desde cero o a optimizar uno existente.
                                </p>
                            </div>
                            <div className="rounded-xl bg-muted p-6 text-center shadow-md">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                                    <Package className="text-primary" size={32} strokeWidth={2} aria-hidden="true"/>
                                </div>
                                <h3 className="text-xl font-semibold text-heading-foreground">Impresión por Demanda</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Fabricamos tus piezas en una variedad de materiales. Perfecto para prototipos o series cortas.
                                </p>
                            </div>
                            <div className="rounded-xl bg-muted p-6 text-center shadow-md">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                                    <Slice className="text-primary" size={32} strokeWidth={2} aria-hidden="true"/>
                                </div>
                                <h3 className="text-xl font-semibold text-heading-foreground">Acabado Profesional</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Ofrecemos post-procesado, lijado, pintura y pulido para dar a tus piezas un acabado de alta calidad.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="reseñas" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <GoogleReviews showTimeDescription={false} />
                </section>

                <section id="contacto" className="bg-background py-16 sm:py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className={sectionHeadingClassName}>¡Empecemos tu proyecto!</h2>
                            <p className="mx-auto mt-4 max-w-xl text-xl text-muted-foreground">
                                Mandanos tu archivo 3D o contanos tu idea. Te enviaremos un presupuesto sin compromiso.
                            </p>
                        </div>
                        <div className="mt-12 sm:mt-16">
                            <Form showBackToHomeButton={false}/>
                        </div>
                    </div>
                </section>

            </main>

            <MainFooter accessibleFeatures={accessibleFeatures} />
        </div>
    );
}
