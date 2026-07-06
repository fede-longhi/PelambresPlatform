import { lusitana } from '@/app/fonts';
import Image from 'next/image';

export function PelambresAuthLogo() {
  return (
    <div className={`${lusitana.className} m-2 flex flex-row items-center text-white`}>
      <Image
        src="/pelambres_logo.svg"
        width={64}
        height={64}
        className="mr-4 block md:my-2"
        alt="Logo de Pelambres"
      />
      <p className="text-[44px]">Pelambres</p>
    </div>
  );
}
