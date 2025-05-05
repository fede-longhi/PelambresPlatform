import Link from 'next/link';

export default function Page() {
    return (
        <div className="flex flex-col items-center justify-center bg-gray-100 p-6">
            <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md text-center">
                <h2 className="text-2xl font-bold text-green-600 mb-4">¡Solicitud enviada con éxito!</h2>
                <p className="text-gray-600 mb-6">
                    Nos pondremos en contacto a la brevedad para brindarte más detalles.
                </p>
                <div className="flex flex-col gap-4">
                <Link
                    href="/"
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                >
                    Volver a la Home
                </Link>
                <Link
                    href="/quote-request"
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                    Realizar otra cotización
                </Link>
                </div>
            </div>
        </div>
    )
}