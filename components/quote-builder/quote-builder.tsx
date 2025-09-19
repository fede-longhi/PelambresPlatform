'use client';

import React, { useRef, useState } from 'react';

import generatePDF, { Margin, Resolution } from 'react-to-pdf';
import html2pdf from 'html2pdf.js';

import { BudgetItem, QuoteInfo, Sender } from '@/app/lib/definitions';
import { formatDateToLocal } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

import { CalendarIcon } from 'lucide-react';
import { ArrowBack, Delete, PictureAsPdf } from '@mui/icons-material';
import QuoteTable from './quote-table';
import QuoteHeader from './quote-header';
import ClientEditor from './quote-client-editor';
import SenderEditor from './quote-sender-editor';
import NotesSection from './quote-notes-section';
import QuoteFooter from './quote-footer';

type QuoteBuilderProps = {
    items?: BudgetItem[];
    onRemoveItem?: (id: string) => void;
    onClearBudget?: () => void;
    defaultSender?: Sender;
};

const DEFAULT_SENDER: Sender = {
    name: "PELAMBRES",
    address: "Fray Luis Beltrán 1423, Martinez, Buenos Aires",
    phone: "+54 11 5892-8659",
    email: "pelambres3d@gmail.com",
    url: "www.pelambres3d.com.ar",
    completeName: "Pelambres 3D"
}

function QuoteBuilder({items, onRemoveItem, onClearBudget, defaultSender=DEFAULT_SENDER}: QuoteBuilderProps) {
    const contentRef = useRef<HTMLDivElement>(null);
    
    const [isEditable, setIsEditable] = useState(true);
    
    const [quoteInfo, setQuoteInfo] = useState<QuoteInfo>({
        date: new Date(),
        quoteValidity: '30',
        sender: defaultSender,
        client: {}
    });

    const handleExportToPdf = () => {
        const filename = getFileName();

        html2pdf().set({
            margin:       4,
            filename:     filename,
            image:        { type: 'png', quality: 1 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true }
        }).from(contentRef.current as HTMLElement).save();

        // const options = {
        //     filename: filename,
        //     method: "save" as "save",
        //     resolution: Resolution.HIGH,
        //     page: {
        //         margin: Margin.MEDIUM,
        //         format: 'letter',
        //     },
        //     canvas: {
        //         mimeType: 'image/png' as 'image/png',
        //         qualityRatio: 1
        //     },
            
        //     overrides: {
        //         pdf: {
        //             compress: true
        //         },
        //         canvas: {
        //             useCORS: true
        //         }
        //     },
        // };

        // generatePDF(contentRef, options);
    };

    const getFileName = () => {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = String(now.getFullYear());
        return `presupuesto-${day}${month}${year}.pdf`;
    };

    const handleRemoveItem = (id: string) => {
        onRemoveItem?.(id);
    }

    const handleClearBudget = () => {
        onClearBudget?.();
    }

    function setDate(day: Date | undefined) {
        setQuoteInfo({...quoteInfo, date: day});
    }

    return (
        <div>
            <div className="flex flex-col w-full justify-center items-center" ref={contentRef}>
                <div className="space-y-4 max-w-3xl">
                    {
                        isEditable &&
                        <div className="mb-4 space-y-4">
                            <div className="mb-4 flex flex-row space-x-4">
                                <div className="rounded-md bg-gray-50 p-4 flex-1">
                                    <h2>Datos del cliente</h2>
                                    <ClientEditor
                                        client={quoteInfo.client}
                                        setClient={(clientAction) => {
                                            setQuoteInfo(prev => ({
                                                ...prev,
                                                client: typeof clientAction === 'function'
                                                    ? clientAction(prev.client)
                                                    : clientAction
                                            }));
                                        }}
                                    />
                                </div>
                                <div className="rounded-md bg-gray-50 p-4 flex-1">
                                    <h2>Tus Datos</h2>
                                    <SenderEditor
                                        sender={quoteInfo.sender}
                                        setSender={(senderAction) => {
                                            setQuoteInfo(prev => ({
                                                ...prev,
                                                sender: typeof senderAction === 'function'
                                                    ? senderAction(prev.sender)
                                                    : senderAction
                                            }));
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-row gap-4 items-center rounded-md bg-gray-50 p-4">
                                <div className="flex flex-col">
                                    <Label htmlFor="date" className="mb-1">Fecha del presupuesto:</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                id="date"
                                                variant="outline"
                                                data-empty={!quoteInfo.date}
                                                className="bg-white data-[empty=true]:text-muted-foreground data-[empty=true]:hover:text-primary-foreground data-[empty=true]:focus:text-primary-foreground w-[280px] justify-start text-left font-normal"
                                            >
                                            <CalendarIcon />
                                            {quoteInfo.date ? formatDateToLocal(quoteInfo.date?.toString(), "es-AR") : <span>Seleccionar fecha</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar mode="single" selected={quoteInfo.date} onSelect={setDate} />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                
                                <div>
                                    <Label htmlFor="quoteValidity" className="mb-1">Validez del presupuesto (días):</Label>
                                    <Input
                                        id="quoteValidity"
                                        type="number"
                                        inputMode="numeric" pattern="\d*"
                                        value={quoteInfo.quoteValidity}
                                        onChange={(e) => setQuoteInfo({...quoteInfo, quoteValidity: e.target.value})}
                                        placeholder="Validez del presupuesto en días"
                                        className="mb-2 w-[280px] bg-white"/>
                                </div>
                            </div>
                        </div>
                    }

                    {
                        !isEditable &&
                        <QuoteHeader quoteInfo={quoteInfo}/>
                    }

                    <QuoteTable items={items} isEditable={isEditable} onRemoveItem={handleRemoveItem} />

                    {
                        isEditable &&
                        <div className="flex justify-end">
                            <div className="flex flex-col space-y-2 w-max">
                                {
                                    items && items.length > 0 &&
                                    <Button
                                        variant="destructive"
                                        onClick={handleClearBudget}
                                        className=""
                                    >
                                        <Delete className="w-4 h-4" />
                                        <span>Borrar todos los items</span>
                                    </Button>
                                }
                            </div>
                        </div>
                    }

                    <NotesSection isEditable={isEditable} quoteInfo={quoteInfo} />

                    <QuoteFooter quoteInfo={quoteInfo} isEditable={isEditable} />
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col items-center">
                {
                    isEditable &&
                    <Button
                        variant="secondary"
                        onClick={() => setIsEditable(!isEditable)}
                        className="w-full"
                    >
                        <PictureAsPdf />
                        Exportar a PDF
                    </Button>
                }
                { 
                    !isEditable &&
                    <div className="flex flex-row space-x-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsEditable(!isEditable)}
                            >
                            <ArrowBack className="w-4 h-4" />
                            <span>Volver a editar</span>
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={handleExportToPdf}
                        >
                            <PictureAsPdf className="w-4 h-4" />
                            <span>Exportar a PDF</span>
                        </Button>
                    </div>
                }
            </div>
        </div>
    );
};

export default QuoteBuilder;