import { lusitana } from '@/app/ui/fonts';
import Image from 'next/image';

export default function PelambresLogo() {
    return (
        <div
            className={`${lusitana.className} flex flex-row md:flex-col
            items-center md:items-start leading-none text-white`}
        >
            <Image
                src="/pelambres_logo.svg"
                width={64}
                height={64}
                className="block md:mb-2 mr-2"
                alt="Logo of Pelambres"
            />
            <p className="text-[44px]">Pelambres</p>
        </div>
    );
}
