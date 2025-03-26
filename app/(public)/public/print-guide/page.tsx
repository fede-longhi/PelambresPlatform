import { Warning } from "@mui/icons-material";

export default function Page() {
    return (
        <div>
            <h1 className="text-center font-medium text-[44px]">Guía de Impresión 3d</h1>
            <p>
            Bienvenido a nuestra guía de impresión 3D. Si es tu primera vez solicitando una impresión o quieres optimizar tus diseños, aquí encontrarás toda la información necesaria para obtener los mejores resultados.
            </p>
            <br />

            <h2 className="text-[38px] text-center p-2 bg-secondary text-secondary-foreground m-12 rounded"> <Warning />- Esta guía aún esta en construcción - <Warning /></h2>

            <p className="font-medium">
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
            <p>
            💡 <b>Consejo:</b> Una buena preparación del archivo y la elección correcta del material pueden hacer una gran diferencia en el resultado final. ¡Sigue leyendo para descubrir cómo lograrlo!
            </p>
            
            <div className="mt-4">
                <h2 className="font-medium text-[32px]">Introducción a la Impresión 3d</h2>
                <p></p>
            </div>
        </div>
    )
}