"use client";

import Image from 'next/image';
import Link from 'next/link';
import { lusitana } from '@/app/ui/fonts';
import { ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function PublicHeader() {
    const router = useRouter();

    function handleBackClick(e: React.MouseEvent) {
        e.preventDefault();
        router.back();
    }

    return(
        <div className={`${lusitana.className} flex flex-row itmes-center leading-none bg-primary text-white p-4 md:pt-6 md:pl-6`}>
            <Button
                size="icon"
                variant="ghost"
                onClick={handleBackClick}
                className="mr-2"
            >
                <ArrowBack className="w-5 md:w-6"/>
            </Button>
            <Link 
                href="/"
                className="flex flex-row items-center"
            >
                <Image
                    src="/pelambres_logo.svg"
                    width={32}
                    height={32}
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
                <h1 className="text-white font-normal text-[32px]">Pelambres</h1>
            </Link>
            <span className="flex-1" />
        </div>
    )
}