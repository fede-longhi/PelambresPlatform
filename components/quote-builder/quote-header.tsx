import React from "react";
import { QuoteInfo } from "@/app/lib/definitions";
import { formatDateToLocal } from '@/lib/utils';

const QuoteHeader = ({quoteInfo} : {quoteInfo: QuoteInfo}) => {
    return (
        <div>
            <div className="flex flex-col md:flex-row md:justify-between mb-4">
                <div>
                    {
                        quoteInfo.sender?.name &&
                        <h2 className="text-2xl font-semibold bg-primary text-primary-foreground text-center justify-center p-4 mb-4">
                            {quoteInfo.sender.name}
                        </h2>
                    }
                    <div className="text-sm text-gray-500 mx-2">
                        {
                            quoteInfo.sender?.address &&
                            <p className="m-0">{quoteInfo.sender.address}</p>
                        }
                        {
                            quoteInfo.sender?.phone &&
                            <p className="m-0">Tel: {quoteInfo.sender.phone}</p>
                        }
                        {
                            quoteInfo.sender?.email &&
                            <p className="m-0">Email: {quoteInfo.sender.email}</p>
                        }
                        {
                            quoteInfo.sender?.url &&
                            <p className="m-0">{quoteInfo.sender.url}</p>
                        }
                    </div>
                </div>
                <div className="mb-2 md:mb-0">
                    <h1 className="text-2xl font-bold text-primary">Presupuesto</h1>
                    <p className="text-sm text-gray-500">
                        Fecha: {quoteInfo.date ? formatDateToLocal(quoteInfo.date.toString(), "es-AR") : formatDateToLocal(new Date().toString(), "es-AR")}
                    </p>
                </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <h3 className="mb-2">Cliente</h3>
                { quoteInfo.client.name && <p className="text-sm text-gray-500 my-0">Nombre: {quoteInfo.client.name}</p> }
                { quoteInfo.client.address && <p className="text-sm text-gray-500 my-0">Dirección: {quoteInfo.client.address}</p> }
                { quoteInfo.client.phone && <p className="text-sm text-gray-500 my-0">Teléfono: {quoteInfo.client.phone}</p> }
                { quoteInfo.client.email && <p className="text-sm text-gray-500 my-0">Email: {quoteInfo.client.email}</p> }
            </div>
        </div>
    );
}

export default QuoteHeader;