"use client";

import Link from 'next/link';
import { lusitana } from '../fonts';
import { WhatsApp } from '@mui/icons-material';

export default function ContactBanner() {
    const textToShare = "Hola, quiero imprimir!";
    
    return (
        <div className='flex flex-col justify-center items-center bg-primary text-primary-foreground p-4 mt-auto'>
            <h1 className={`${lusitana.className} font-medium text-[32px] mb-4`}>Contactanos</h1>
            <Link
            href={`https://wa.me/5491158928659?text=${textToShare}`} target='_blank'
            className="bg-green-500 rounded-full px-4 py-2 shadow-md mb-4 items-center">
                <WhatsApp className='mr-2'/> 
                <span>Escribime por WhatsApp</span>
            </Link>
        </div>
    )
}