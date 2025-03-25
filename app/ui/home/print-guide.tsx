"use client";

import Image from "next/image";
import { lusitana } from "../fonts";
import Link from "next/link";
import { School } from "@mui/icons-material";

export default function PrintGuideBanner() {
    return (
        <div className="flex flex-col items-center bg-slate-100 h-screen">
            <h1 className={`${lusitana.className} font-medium text-[44px] my-12`}>
                Impresión 3d
            </h1>
            <Link href="/public/print-guide" className="flex items-center">
                <School className="mr-2"/>
                <span>Ver Guia</span>
            </Link>

            <div className="flex flex-col space-y-6 max-w-[1000px]">
                <div className="flex flex-row items-center md:mx-12 justify-center bg-slate-200 rounded-xl">
                    <Image
                        className="rounded-l-xl"
                        width={256}
                        height={256}
                        src="/images/render_3d.png"
                        alt="3d printer image"
                    />
                    <div className="text-[24px] p-6 md:p-12">
                        <p>La impresión 3D es un proceso para materializar objetos físicos en 3 dimensiones a partir de modelos digitales, permitiendo crear desde prototipos hasta piezas funcionales.</p>
                    </div>
                </div>
                
                <div className="flex flex-row items-center md:mx-12 justify-center bg-slate-200 rounded-xl">
                    <div className="text-[24px] p-6 md:p-12">
                        <p>Utilizamos tecnología FDM (modelado por deposición fundida). Que implica, básicamente, derretir material e ir depositandolo capa por capa hasta obtener un modelo completo.</p>
                    </div>
                    <Image
                        className="rounded-r-xl"
                        width={256}
                        height={256}
                        src="/images/pelambrito_printed.webp"
                        alt="3d printer image"
                    />
                </div>
            </div>
        </div>
    )
}