import Image from 'next/image';
import Link from 'next/link';
import { lusitana } from '@/app/ui/fonts';

export default function PublicHeader() {
    return(
        <div className={`${lusitana.className} flex flex-row leading-none bg-primary text-white p-2 pt-6 pl-6`}>
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
                <h1 className="text-white font-normal text-[32px]">Pelambres</h1>
            </Link>
            <span className="flex-1" />
        </div>
    )
}