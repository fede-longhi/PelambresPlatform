import Image from 'next/image';
import Link from 'next/link';
import Form from "@/app/ui/quote/quote-form";
import { Package, DraftingCompass, Slice } from "lucide-react"; 
import { GoogleReviews } from '@/components/google-reviews/google-reviews';

export default function Page() {
    return (
        <div className="flex min-h-screen flex-col w-full bg-gray-100 text-gray-800">
            <header className="bg-gradient-to-r from-primary to-yellow-500 shadow-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4 md:justify-start md:space-x-10">

                        <div className="flex justify-start lg:w-0 lg:flex-1 items-center">
                            <Image
                                src="/pelambres_logo.svg"
                                width={48}
                                height={48}
                                className="hidden md:block m-2"
                                alt="Logo of Pelambres"
                            />
                            <Image
                                src="/pelambres_logo.svg"
                                width={64}
                                height={64}
                                className="md:hidden block mr-2"
                                alt="Logo of Pelambres"
                            />
                            <Link href="/" className="text-3xl font-bold text-primary-foreground">Pelambres<span className="text-orange-200">3D</span></Link>
                        </div>
                        <nav className="hidden md:flex space-x-10">
                            <Link href="/quote-request" className="text-base font-medium text-primary-foreground hover:text-primary">Cotizá</Link>
                            <Link href='/print-status' className="text-base font-medium text-primary-foreground hover:text-primary">Mi Pedido</Link>
                            <Link href='/tools' className="text-base font-medium text-primary-foreground hover:text-primary">Herramientas</Link>
                            <Link href='/print-guide' className="text-base font-medium text-primary-foreground hover:text-primary">Guía de Impresión</Link>
                        </nav>
                    </div>
                </div>
            </header>

            <main className="space-y-20">
                <section className="relative bg-white pt-12 sm:pt-16 lg:pt-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
                            <div className="relative z-10 lg:py-12">
                                <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl lg:text-6xl">
                                    Transformamos tus ideas en realidad con <span className="text-primary">impresión 3D</span>
                                </h1>
                                <p className="mt-4 text-xl text-gray-500">
                                    Ofrecemos servicios de prototipado rápido, fabricación de piezas y diseño personalizado con la más alta precisión.
                                </p>
                                <div className="mt-8 sm:mt-10 sm:flex sm:gap-4">
                                    <Link
                                    href='/quote-request'
                                    className="bg-primary text-primary-foreground rounded-full px-6 py-3 items-center justify-center shadow-sm">
                                        Solicitar un presupuesto
                                    </Link>
                                    <a href="#proyectos" className="mt-4 sm:mt-0 w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-indigo-600 text-base font-medium rounded-full text-indigo-600 bg-white hover:bg-indigo-50">
                                        Explorar proyectos
                                    </a>
                                </div>
                            </div>

                            {/* <div className="mt-12 lg:mt-0">
                                <div className="aspect-w-16 aspect-h-9 overflow-hidden rounded-xl shadow-lg">
                                    <img src="https://placehold.co/1200x800/222222/cccccc?text=Impresora+3D+en+acción" alt="Una impresora 3D en funcionamiento" className="w-full h-full object-cover rounded-xl" />
                                </div>
                            </div> */}

                            <div className="mt-12 lg:mt-0">
                                <div className="overflow-hidden rounded-xl shadow-lg">
                                    <Image
                                        src="/images/imagen_1.png"
                                        alt="Una impresora 3D en funcionamiento"
                                        className="object-cover rounded-xl"
                                        width={1200}
                                        height={10}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="proyectos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-extrabold text-center text-gray-900 sm:text-4xl">Nuestros Proyectos</h2>
                    <p className="mt-4 text-center text-gray-500 max-w-2xl mx-auto">
                        Mira algunos de los trabajos que hemos hecho. Desde prototipos industriales hasta figuras artísticas, todo es posible.
                    </p>
                    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* <!-- Proyecto 1 --> */}
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
                            <img src="https://placehold.co/600x400/3d74d2/ffffff?text=Prototipo+de+Auto" alt="Prototipo de un automóvil en 3D" className="w-full h-56 object-cover" />
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-gray-900">Repuesto Automotriz</h3>
                                <p className="mt-2 text-gray-600 text-sm">Repuestos especiales para vehículos que no se consiguen en el mercado, fabricados con precisión y materiales de alta calidad.</p>
                            </div>
                        </div>

                        {/* <!-- Proyecto 2 --> */}
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
                            <img src="https://placehold.co/600x400/d9a336/ffffff?text=Pieza+de+Maquinaria" alt="Pieza de maquinaria impresa en 3D" className="w-full h-56 object-cover" />
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-gray-900">Pieza Industrial</h3>
                                <p className="mt-2 text-gray-600 text-sm">Pieza industriales, optimizada para mayor resistencia y menor peso.</p>
                            </div>
                        </div>

                        {/* <!-- Proyecto 3 --> */}
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
                            <img src="https://placehold.co/600x400/9b59b6/ffffff?text=Figura+Artística" alt="Figura artística impresa en 3D" className="w-full h-56 object-cover" />
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-gray-900">Figura de Colección</h3>
                                <p className="mt-2 text-gray-600 text-sm">Figuras personalizadas, trabajadas a mano para un acabado único.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="servicios" className="bg-white py-16 sm:py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-extrabold text-center text-gray-900 sm:text-4xl">Nuestros Servicios</h2>
                        <p className="mt-4 text-center text-gray-500 max-w-2xl mx-auto">
                            Ofrecemos una gama de servicios para cubrir todas tus necesidades de fabricación.
                        </p>
                        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
                            <div className="bg-gray-50 p-6 rounded-xl shadow-md text-center">
                                <div className="bg-primary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                    <DraftingCompass className="text-primary" size={32} strokeWidth={2}/>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900">Diseño y Modelado 3D</h3>
                                <p className="mt-2 text-gray-600 text-sm">
                                    ¿No tienes un archivo 3D? Te ayudamos a crear el modelo desde cero o a optimizar uno existente.
                                </p>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-xl shadow-md text-center">
                                <div className="bg-primary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                    <Package className="text-primary" size={32} strokeWidth={2}/>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900">Impresión por Demanda</h3>
                                <p className="mt-2 text-gray-600 text-sm">
                                    Fabricamos tus piezas en una variedad de materiales. Perfecto para prototipos o series cortas.
                                </p>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-xl shadow-md text-center">
                                <div className="bg-primary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                    <Slice className="text-primary" size={32} strokeWidth={2}/>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900">Acabado Profesional</h3>
                                <p className="mt-2 text-gray-600 text-sm">
                                    Ofrecemos post-procesado, lijado, pintura y pulido para dar a tus piezas un acabado de alta calidad.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="reseñas" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <GoogleReviews showTimeDescription={false} />
                </section>

                <section id="contacto" className="bg-white py-16 sm:py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">¡Empecemos tu proyecto!</h2>
                            <p className="mt-4 text-xl text-gray-500 max-w-xl mx-auto">
                                Envíanos tu archivo 3D o cuéntanos tu idea. Te enviaremos un presupuesto sin compromiso.
                            </p>
                        </div>
                        <div className="mt-12 sm:mt-16">
                            <Form />
                        </div>
                    </div>
                </section>

            </main>

            <footer className="bg-gray-800 text-gray-400 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p>&copy; 2025 Pelambres3D. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
}
