import Link from 'next/link';
import { lusitana } from '@/app/ui/fonts';
import Image from 'next/image';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col">
        <div className="flex flex-col bg-primary">
            <div className="flex flex-row-reverse">
                <Link
                href="/login"
                className="flex flex-row text-white mx-8 mt-4" 
                >
                    <span>Login</span>
                    <ArrowRightIcon className="w-5 md:w-6 ml-2" />
                </Link>
            </div>

            <div className="flex justify-center pt-20 pb-8 bg-primary">    
                <div
                    className={`${lusitana.className} flex flex-col items-center leading-none text-white`}
                >
                    <Image
                        src="/pelambres_logo.svg"
                        width={128}
                        height={128}
                        className="hidden md:block mb-8"
                        alt="Logo of Pelambres"
                    />
                    <p className="text-[64px] mb-2">Pelambres</p>
                    <p className="text-[18px]">Haciendo realidad tus proyectos</p>
                </div>
            </div>
            <div className="flex justify-center p-8 bg-primary">
                <div className="flex flex-row space-x-2 font-medium">
                    <Link
                        href="/public/quote"
                        className="flex items-center gap-5 self-start rounded-lg bg-secondary px-6 py-3
                        text-sm font-medium text-slate-800 transition-colors
                        hover:shadow-xl
                        hover:text-primary-foreground
                        md:text-base"
                        >
                        <span>Cotiza tu proyecto</span>
                    </Link>
                    <Link
                        href="/public/print-status"
                        className="flex items-center gap-5 self-start rounded-lg bg-secondary px-6 py-3
                        text-sm font-medium text-slate-800 transition-colors
                        hover:bg-purple-800
                        hover:text-primary-foreground
                        md:text-base"
                        >
                        <span>Ver mi impresión</span>
                    </Link>

                </div>
            </div>
        </div>
    </main>
  );
}
