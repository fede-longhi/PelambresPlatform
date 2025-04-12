import { Header } from "@/app/ui/print-guide/components";
import { Lightbulb } from "lucide-react";

export default function Page() {
    return (
        <div>
            <Header title="Guía de Impresión 3d" />
            <p>
                Bienvenido a nuestra guía de impresión 3D. Si es tu primera vez solicitando una impresión o quieres optimizar tus diseños, aquí encontrarás toda la información necesaria para obtener los mejores resultados.
            </p>
            <br />
            <p className="font-medium text-[18px] mb-2">
                En esta guía aprenderás:
            </p>

            <ul>
                <li>
                ✅ Cómo preparar tu archivo 3D para evitar errores de impresión.
                </li>
                <li>
                ✅ Qué materiales elegir según la resistencia y el acabado que necesites.
                </li>
                <li>
                ✅ Factores que influyen en el precio y tiempo de producción.
                </li>
                <li>
                ✅ Cómo solicitar una cotización y realizar un pedido en nuestro sitio.
                </li>
            </ul>
            <br />
            <div className="flex flex-row bg-secondary/50 p-4">
                <Lightbulb className="mr-2 text-primary"/><b className="mr-2">Consejo:</b> Una buena preparación del archivo y la elección correcta del material pueden hacer una gran diferencia en el resultado final. ¡Sigue leyendo para descubrir cómo lograrlo!
            </div>
        </div>
    )
}