import Image from "next/image";
import { lusitana } from "../fonts";
import Link from "next/link";

export default function PrintGuideBanner() {
    return (
        <div className="flex flex-col items-center justify-center bg-slate-100">
            <h1 className={`${lusitana.className} font-medium text-[32px] my-4`}>
                Impresión 3d
            </h1>
            <Link href="/public/print-guide">
                <span>Ver Guia</span>
            </Link>
            <div className="flex flex-row items-start m-4">
                <Image
                    width={600}
                    height={600}
                    src="/images/3d_printer.png"
                    alt="3d printer image"
                />
            </div>
        </div>
    )
}