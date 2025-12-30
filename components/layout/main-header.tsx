'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { DollarSign, ArrowRight, Menu, X } from 'lucide-react';


const navItems = [
    { title: "Mi Pedido", href: "/print-status" },
    { title: "Herramientas", href: "/tools" },
    { title: "Guía de Impresión", href: "/print-guide" },
];

export default function MainHeader() {
    const isProduction = process.env.IS_PRODUCTION === 'true'; 
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="bg-gradient-to-r from-primary to-yellow-500 shadow-xl sticky top-0 z-50 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-3 md:py-4 md:space-x-10">
                    
                    <div className="flex justify-start items-center space-x-2 z-20">
                        <button 
                            className="md:hidden p-2 text-white hover:opacity-80 transition"
                            onClick={() => setIsMenuOpen(true)}
                            aria-label="Abrir menú de navegación"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        <Link href="/" className="flex items-center space-x-2">
                            <Image
                                src="/pelambres_logo.svg"
                                width={64}
                                height={64}
                                className="w-8 h-8 md:w-10 md:h-10" 
                                alt="Logo de Pelambres"
                                priority={true} 
                            />
                            <h1 className="text-2xl font-bold text-white tracking-tight">
                                Pelambres
                                <span className="text-orange-300">3D</span>
                            </h1>
                        </Link>
                    </div>
                    
                    <nav className="hidden md:flex space-x-8 items-center">
                        {navItems.map((item) => (
                            <Link 
                                key={item.href}
                                href={item.href} 
                                className="text-base font-medium transition hover:text-white/80"
                            >
                                {item.title}
                            </Link>
                        ))}
                    </nav>

                    <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0 space-x-4">
                        <Link href='/quote-request' passHref>
                            <Button variant="secondary" className="rounded-full shadow-lg transition-transform hover:scale-[1.02]">
                                <DollarSign className="w-5 h-5 mr-2" />
                                Solicitar Presupuesto
                            </Button>
                        </Link>
                        {
                            !isProduction && (
                                <Link 
                                    href="/login" 
                                    className={buttonVariants({ variant: 'ghost', className: 'text-white hover:bg-white/10' })}
                                >
                                    Login 
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            )
                        }
                    </div>
                    
                </div>
            </div>

            {/* -------------------- Mobile Menu -------------------- */}
            <div 
                className={`fixed inset-0 bg-black/50 z-40 transition-opacity md:hidden ${
                    isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setIsMenuOpen(false)}
            ></div>

            <div 
                className={`fixed top-0 left-0 w-64 h-full bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
                    isMenuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="p-4 flex justify-end">
                    <button 
                        className="text-gray-800 hover:text-primary transition"
                        onClick={() => setIsMenuOpen(false)}
                        aria-label="Cerrar menú de navegación"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex flex-col p-4 space-y-2">
                    {navItems.map((item) => (
                        <Link 
                            key={item.href}
                            href={item.href} 
                            className="block p-3 text-lg font-medium text-gray-700 hover:bg-gray-100 rounded transition"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {item.title}
                        </Link>
                    ))}

                    <hr className="my-4 border-gray-200" />

                    <Link href='/quote-request' passHref>
                        <Button 
                            className="w-full mt-2" 
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <DollarSign className="w-5 h-5 mr-2" />
                            Solicitar Presupuesto
                        </Button>
                    </Link>
                    
                    {
                        !isProduction && (
                            <Link href="/login" passHref>
                                <Button variant="ghost" className="w-full mt-2 text-gray-700 hover:bg-gray-100">
                                    Login 
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        )
                    }
                </nav>
            </div>
        </header>
    );
}