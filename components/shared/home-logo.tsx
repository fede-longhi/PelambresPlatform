import { lusitana } from '@/app/fonts';
import Image from 'next/image';

export default function PelambresLogo() {
    return (
        <div
            className={`${lusitana.className} flex flex-row text-white m-2 items-center`}
        >
            <Image
                src="/pelambres_logo.svg"
                width={64}
                height={64}
                className="block md:my-2 mr-4"
                alt="Logo of Pelambres"
            />
            <p className="text-[44px]">Pelambres</p>
        </div>
    );
}
