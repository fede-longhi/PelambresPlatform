import Link from 'next/link';
import { lusitana } from '@/app/ui/fonts';
import Image from 'next/image';

export default function HomeBanner() {
    return (
        <div className="bg-primary">
            <div className="flex justify-center pt-20 pb-8 bg-primary">
                <div
                    className={`flex flex-col items-center leading-none text-slate-100`}
                >
                    <Image
                        src="/pelambres_logo.svg"
                        width={128}
                        height={128}
                        className="block mb-8"
                        alt="Logo of Pelambres"
                    />
                    <p className={`${lusitana.className} text-[64px] mb-2`}>Pelambres</p>
                    <p className="text-[18px]">Impresión y diseño 3d</p>
                </div>
            </div>

            <div className="flex flex-col p-4 space-y-4 font-medium justify-center items-center mb-4 md:hidden">
                <Link
                    href="/public/quote"
                    className="rounded-lg bg-secondary px-6 py-3
                    text-md font-medium text-slate-800 transition-colors
                    shadow-md
                    hover:bg-purple-800
                    hover:text-primary-foreground"
                    >
                    <span>Cotiza tu proyecto</span>
                </Link>
                <Link
                    href="/public/print-status"
                    className="rounded-lg bg-secondary px-6 py-3
                    text-md font-medium text-slate-800 transition-colors
                    shadow-md
                    hover:bg-purple-800
                    hover:text-primary-foreground
                    md:text-base"
                    >
                    <span>Ver estado de mi pedido</span>
                </Link>
            </div>

            <div className="justify-center p-8 bg-primary hidden md:flex">
                <div className="flex flex-row space-x-2 font-medium">
                    <Link
                        href="/public/quote"
                        className="flex items-center gap-5 self-start rounded-lg bg-secondary px-6 py-3
                        text-sm font-medium text-slate-800 transition-colors
                        shadow-md
                        hover:bg-purple-800
                        hover:text-primary-foreground
                        md:text-base"
                        >
                        <span>Cotiza tu proyecto</span>
                    </Link>
                    <Link
                        href="/public/print-status"
                        className="flex items-center gap-5 self-start rounded-lg bg-secondary px-6 py-3
                        text-sm font-medium text-slate-800 transition-colors
                        shadow-md
                        hover:bg-purple-800
                        hover:text-primary-foreground
                        md:text-base"
                        >
                        <span>Ver estado de mi pedido</span>
                    </Link>
                </div>
            </div>
        </div>
    )
}