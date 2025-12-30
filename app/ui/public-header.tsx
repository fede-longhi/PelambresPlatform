"use client";

import Image from 'next/image';
import Link from 'next/link';
import { lusitana } from '@/app/ui/fonts';
import { ArrowLeft } from 'lucide-react'; 
import { useRouter } from 'next/navigation';

export default function PublicHeader() {
    const router = useRouter();

    function handleBackClick(e: React.MouseEvent) {
        e.preventDefault();
        router.back();
    }

    return(
        <div className={`${lusitana.className} flex items-center justify-start leading-none 
                       bg-gradient-to-r from-primary to-yellow-500 shadow-md sticky top-0 z-50 p-4 md:p-6 w-full`}>
            <ArrowLeft
                className="w-6 h-6 mr-3 cursor-pointer transition text-white hover:text-white/80" 
                onClick={handleBackClick}
            />
            
            <Link 
                href="/"
                className="flex items-center space-x-2"
            >
                <Image
                    src="/pelambres_logo.svg"
                    width={40}
                    height={40}
                    className="w-8 h-8 md:w-10 md:h-10" 
                    alt="Logo de Pelambres"
                    priority={true}
                />
                <h1 className="text-primary-foreground font-normal text-[28px] md:text-[32px]">
                    Pelambres
                </h1>
            </Link>

            <span className="flex-1" />
        </div>
    )
}