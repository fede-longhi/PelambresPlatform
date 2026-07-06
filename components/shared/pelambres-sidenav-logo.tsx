import { lusitana } from '@/app/fonts';
import Image from 'next/image';

export function PelambresSidenavLogo() {
  return (
    <div className={`${lusitana.className} flex flex-row items-center justify-center gap-2 text-white`}>
      <Image
        src="/pelambres_logo.svg"
        width={48}
        height={48}
        className="h-9 w-9 shrink-0 md:h-11 md:w-11"
        alt="Logo de Pelambres"
      />
      <p className='text-2xl font-bold'>
        Pelambres
        <span className="text-orange-300">3D</span>
      </p>
    </div>
  );
}
