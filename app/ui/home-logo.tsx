import { lusitana } from '@/app/ui/fonts';
import Image from 'next/image';

export default function PelambresLogo() {
    return (
        <div
            className={`${lusitana.className} flex flex-col leading-none text-white`}
        >
            <Image
                src="/pelambres_logo.svg"
                width={64}
                height={64}
                className="block mb-2"
                alt="Logo of Pelambres"
            />
            <p className="text-[44px]">Pelambres</p>
        </div>
    );
}
