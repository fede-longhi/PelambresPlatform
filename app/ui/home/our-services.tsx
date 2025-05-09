"use client";

import Link from "next/link";
import { lusitana } from "../fonts";
import { OpenInNew, School } from "@mui/icons-material";
import { HomeCard } from "./cards";

export default function OurServicesBanner() {
    return (
        <div className="flex flex-col items-center bg-slate-200 pb-12">
            <h1 className={`${lusitana.className} font-medium text-[44px] my-12`}>
                Nuestros Servicios
            </h1>
            <div className="flex flex-col space-y-6 max-w-[1000px]">
                <HomeCard
                    title="Modelado y desarrollo"
                    description="Te ayudamos a desarrollar tu propio proyecto para que puedas crear el producto que quieras!"
                    imagePosition="left"
                    imageName="/images/imagen_1.png"
                    titleLink="/quote-request"
                    />
                <HomeCard
                    title="Impresión a demanda"
                    description="¿Ya tenés tu diseño listo? Envíanos tu archivo y te lo imprimimos en la mejor calidad y material según tus necesidades."
                    imagePosition="right"
                    imageName="/images/imagen_2.png"
                    titleLink="/quote-request"
                    />
                <HomeCard
                    title="Prototipos"
                    description="Imprimimos prototipos para que puedas probar y perfeccionar tus diseños. Te asesoramos para encontrar la mejor forma de imprimirlos optimizando costos y materiales."
                    imagePosition="left"
                    imageName="/images/imagen_3.png"
                    titleLink="/quote-request"
                    />
                <HomeCard
                    title="Soluciones a medida"
                    description="Realizamos todo el proceso desde el inicio hasta la entrega para poder brindarte una solución a tu problema de forma creativa eficiente y funcional. Con soluciones que van más allá de la impresión 3d."
                    imagePosition="right"
                    imageName="/images/pelambrito_printed.webp"
                    titleLink="/quote-request"
                />

            </div>


            <div className="flex flex-col md:flex-row m-12 text-[18px] text-center md:text-left">
                <p>No olvides consultar nuestra </p>
                    <Link href="/print-guide"
                    target="_blank"
                    className="flex items-center justify-center md:justify-start mx-1 rounded-md px-2">
                        <School className="mr-2"/>
                        <span>Guía de impresión</span>
                        <OpenInNew className="ml-2"/>
                    </Link>
                <p> para aprovechar al máximo nuestros servicios.</p>
            </div>  
        </div>
    )
}