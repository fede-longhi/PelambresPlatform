import Link from 'next/link';
import Image from 'next/image';
import { Mail, MapPin } from 'lucide-react'; // Íconos para contacto y redes
import { WhatsApp, Instagram } from '@mui/icons-material';

const navLinks = [
    { title: "Inicio", href: "/" },
    { title: "Cotizar Ahora", href: "/quote-request" },
    { title: "Mi Pedido", href: "/print-status" },
    { title: "Guía de Impresión", href: "/print-guide" },
];

const toolLinks = [
    { title: "Todas las Herramientas", href: "/tools" },
    { title: "Calculadora de Costos", href: "/tools/calculator" },
    { title: "Generador de Presupuestos", href: "/tools/quote-builder" },
];

const textToShare = "Hola, quiero imprimir!";
const mailAddress = "pelambres3d@gmail.com";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-gray-300 border-t border-gray-800 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4">

                    <div className="space-y-4 col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center space-x-2">
                            <Image
                                src="/pelambres_logo.svg" // TODO: Usar un logo en blanco para fondo oscuro
                                width={32}
                                height={32}
                                alt="Logo de Pelambres"
                            />
                            <span className="text-xl font-bold text-white">Pelambres<span className="text-primary/80">3D</span></span>
                        </Link>
                        <p className="text-sm text-gray-400 max-w-xs">
                            Transformamos ideas en piezas funcionales y prototipos de alta calidad para creadores y negocios.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Navegación</h3>
                        <ul className="space-y-2">
                            {navLinks.map((link) => (
                                <li key={link.title}>
                                    <Link 
                                        href={link.href} 
                                        className="text-sm transition hover:text-primary"
                                    >
                                        {link.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Herramientas Maker</h3>
                        <ul className="space-y-2">
                            {toolLinks.map((link) => (
                                <li key={link.title}>
                                    <Link 
                                        href={link.href} 
                                        className="text-sm transition hover:text-primary"
                                    >
                                        {link.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>


                    <div className="space-y-4 col-span-2 md:col-span-1">
                        <h3 className="text-lg font-semibold text-white">Contacto</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>
                                <Link
                                href={`mailto:${mailAddress}`} 
                                className="flex items-center space-x-2 hover:text-primary transition-colors cursor-pointer">
                                    <Mail className="w-4 h-4 text-primary" />
                                    <span>{mailAddress}</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                href="https://maps.app.goo.gl/epG7Ayvaf6esnJwz5"
                                target='_blank'
                                className="flex items-center space-x-2 hover:text-primary transition">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    <span>Martínez, Buenos Aires, Argentina</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                href={`https://wa.me/5491158928659?text=${textToShare}`}
                                target='_blank'
                                className="hover:text-primary transition">
                                    <WhatsApp className="text-green-600" fontSize="small"/>
                                    <span className="ml-2">+54 9 11 5892-8659</span>
                                </Link>
                            </li>
                        </ul>
                        
                        <div className="flex space-x-4 pt-2">
                            <Link href='https://instagram.com/pelambres3d' aria-label="Instagram" target='_blank'
                            className="text-gray-400 hover:text-primary transition">
                                <Instagram className="w-6 h-6" />
                            </Link>
                           
                        </div>
                    </div>
                </div>

                <div className="pt-8 mt-8 border-t border-gray-800 text-center">
                    <p className="text-sm text-gray-400">
                        &copy; {currentYear} Pelambres 3D. Todos los derechos reservados.
                    </p>
                </div>
            </div>
        </footer>
    );
}