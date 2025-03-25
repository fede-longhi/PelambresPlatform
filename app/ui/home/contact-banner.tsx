"use client";

import Link from 'next/link';
import { lusitana } from '../fonts';
import { Instagram, Mail, WhatsApp } from '@mui/icons-material';

export default function ContactBanner() {
    const textToShare = "Hola, quiero imprimir!";
    const mailAddress = "pelambres3d@gmail.com";
    
    return (
        <div className='flex flex-col justify-center items-center bg-primary text-primary-foreground p-4 mt-auto pb-6 md:pb-12'>
            <h1 className={`${lusitana.className} font-medium text-[44px] mb-4`}>Contactanos</h1>
            <div className='flex flex-col items-center space-y-4 justify-center md:flex-row md:space-x-4 md:space-y-0 mb-2 md:mb-4'>
                <Link
                href={`https://wa.me/5491158928659?text=${textToShare}`} target='_blank'
                className="bg-green-500 rounded-full px-4 py-2 shadow-md items-center">
                    <WhatsApp className='mr-2'/> 
                    <span>+54 9 11-5892-8659</span>
                </Link>
                <Link
                href={`mailto:${mailAddress}`} target='_blank'
                className="bg-blue-500 rounded-full px-4 py-2 shadow-md items-center">
                    <Mail className='mr-2'/> 
                    <span>pelambres3d@gmail.com</span>
                </Link>
            </div>
            <div>
                <Link
                href={`https://instagram.com/pelambres3d`} target='_blank'
                className="rounded-full items-center">
                    <Instagram/>
                </Link>

            </div>
        </div>
    )
}