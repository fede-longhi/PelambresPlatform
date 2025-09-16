'use client';

import React, { useRef, useState } from 'react';

import html2pdf from 'html2pdf.js';

import { BudgetItem } from '@/app/lib/definitions';
import { formatDateToLocal } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Switch } from '@/components/ui/switch';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { CalendarIcon } from 'lucide-react';
import { Add as AddIcon, ArrowBack, Delete, ExpandLess, MoreHoriz, MoreVert, PictureAsPdf } from '@mui/icons-material';

type QuotePreviewProps = {
    items?: BudgetItem[];
    onRemoveItem?: (id: string) => void;
    onClearBudget?: () => void;
};

type Client = {
    name?: string;
    address?: string;
    email?: string;
    phone?: string;
}

type Sender = {
    name?: string;
    completeName?: string;
    address?: string;
    email?: string;
    phone?: string;
    url?: string;
}

// type Discount = {
//     id: number;
//     name: string;
//     percentage: number;
// }

// type Tax = {
//     id: number;
//     name: string;
//     percentage: number;
// }

function QuotePreview({items, onRemoveItem, onClearBudget}: QuotePreviewProps) {
    const contentRef = useRef<HTMLDivElement>(null);
    
    const [isEditable, setIsEditable] = useState(true);
    const [showDiscountColumn, setShowDiscountColumn] = useState(true);
    const [client, setClient] = useState({} as Client);
    const [sender, setSender] = useState({
        name: "PELAMBRES",
        address: "Fray Luis Beltrán 1423, Martinez, Buenos Aires",
        phone: "+54 11 5892-8659",
        email: "pelambres3d@gmail.com",
        url: "www.pelambres3d.com.ar",
        completeName: "Pelambres 3D"
    } as Sender);
    const [date, setDate] = React.useState<Date>();
    const [quoteValidity, setQuoteValidity] = useState('30');

    const budgetTotal = items ? items.reduce((sum, item) => sum + (item.totalPrice * (1 - item.discount/100)), 0) : 0;
    const handleExportToPdf = () => {
        const filename = getFileName();

        const options = {
            filename: filename,
            margin: 1,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
        };

        html2pdf().set(options).from(contentRef.current!).save();
    };

    const getFileName = () => {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = String(now.getFullYear());
        return `presupuesto-${day}${month}${year}.pdf`;
    };

    const getColSpan = () => {
        return showDiscountColumn ? 3 : 2;
    }
    
    const handleRemoveItem = (id: string) => {
        onRemoveItem && onRemoveItem(id);
    }

    const handleClearBudget = () => {
        onClearBudget && onClearBudget();
    }

    return (
        <div>
            <div className="space-y-4" ref={contentRef}>
                {
                    isEditable &&
                    <div className="mb-4 space-y-4">
                        <div className="mb-4 flex flex-row space-x-4">
                            <div className="rounded-md bg-gray-50 p-4 flex-1">
                                <h2>Datos del cliente</h2>
                                <ClientEditor
                                    client={client}
                                    setClient={setClient}
                                />
                            </div>
                            <div className="rounded-md bg-gray-50 p-4 flex-1">
                                <h2>Tus Datos</h2>
                                <SenderEditor
                                    sender={sender}
                                    setSender={setSender}
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
                                            data-empty={!date}
                                            className="bg-white data-[empty=true]:text-muted-foreground data-[empty=true]:hover:text-primary-foreground data-[empty=true]:focus:text-primary-foreground w-[280px] justify-start text-left font-normal"
                                        >
                                        <CalendarIcon />
                                        {date ? formatDateToLocal(date.toString(), "es-AR") : <span>Seleccionar fecha</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar mode="single" selected={date} onSelect={setDate} />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            
                            <div>
                                <Label htmlFor="quoteValidity" className="mb-1">Validez del presupuesto (días):</Label>
                                <Input
                                    id="quoteValidity"
                                    type="number"
                                    inputMode="numeric" pattern="\d*"
                                    value={quoteValidity}
                                    onChange={(e) => setQuoteValidity(e.target.value)}
                                    placeholder="Validez del presupuesto en días"
                                    className="mb-2 w-[280px] bg-white"/>
                            </div>
                        </div>
                        <div className="flex flex-row items-center space-x-2 justify-end">
                            <Label htmlFor="toggle-discount-column" className="">Mostrar columna de descuento</Label>
                            <Switch
                                id="toggle-discount-column"
                                checked={showDiscountColumn}
                                onCheckedChange={() => setShowDiscountColumn(!showDiscountColumn)}
                            />
                        </div>
                    </div>
                }

                {
                    !isEditable &&
                    <div>
                        <div className="flex flex-col md:flex-row md:justify-between mb-4">
                            <div>
                                {
                                    sender?.name &&
                                    <h2 className="text-2xl font-semibold bg-primary text-primary-foreground text-center justify-center p-4 mb-4">
                                        {sender.name}
                                    </h2>
                                }
                                <div className="text-sm text-gray-500 mx-2">
                                    {
                                        sender?.address &&
                                        <p className="m-0">{sender.address}</p>
                                    }
                                    {
                                        sender?.phone &&
                                        <p className="m-0">Tel: {sender.phone}</p>
                                    }
                                    {
                                        sender?.email &&
                                        <p className="m-0">Email: {sender.email}</p>
                                    }
                                    {
                                        sender?.url &&
                                        <p className="m-0">{sender.url}</p>
                                    }
                                </div>
                            </div>
                            <div className="mb-2 md:mb-0">
                                <h1 className="text-2xl font-bold text-primary">Presupuesto</h1>
                                <p className="text-sm text-gray-500">
                                    Fecha: {date ? formatDateToLocal(date.toString(), "es-AR") : formatDateToLocal(new Date().toString(), "es-AR")}
                                </p>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                            <h3 className="mb-2">Cliente</h3>
                            { client.name && <p className="text-sm text-gray-500 my-0">Nombre: {client.name}</p> }
                            { client.address && <p className="text-sm text-gray-500 my-0">Dirección: {client.address}</p> }
                            { client.phone && <p className="text-sm text-gray-500 my-0">Teléfono: {client.phone}</p> }
                            { client.email && <p className="text-sm text-gray-500 my-0">Email: {client.email}</p> }
                        </div>
                    </div>
                }
                <Table>
                    <TableHeader>
                        <TableRow className="">
                            <TableHead className="w-[100px]">Descripción</TableHead>
                            <TableHead className="text-right">Precio unitario</TableHead>
                            <TableHead className="text-right">Cantidad</TableHead>
                            {
                                showDiscountColumn &&
                                <TableHead className="text-right">Descuento</TableHead>
                            }
                            <TableHead className="text-right">Precio Total</TableHead>
                            {
                                isEditable &&
                                <TableHead className="w-[40px]">Action</TableHead>
                            }
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items && items.map(item => (
                            <TableRow key={item.id}>
                                <TableCell className="pl-2">{item.name}</TableCell>
                                <TableCell className="text-right">${item.individualPrice.toFixed(2)}</TableCell>
                                <TableCell className="text-right">{item.quantity}</TableCell>
                                {
                                    showDiscountColumn &&
                                    <TableCell className="text-right">${(item.totalPrice * (item.discount/100)).toFixed(2)} ({item.discount.toFixed(2)}%)</TableCell>
                                }
                                <TableCell className="text-right">${(item.totalPrice * (1 - item.discount/100)).toFixed(2)}</TableCell>
                                {
                                    isEditable &&
                                    <TableCell>
                                        <Button
                                            onClick={() => handleRemoveItem(item.id)}
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-100"
                                        >
                                            <Delete className="w-5 h-5" />
                                        </Button>
                                    </TableCell>
                                }
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={getColSpan()}></TableCell>
                            <TableCell className="font-semibold text-right">Total</TableCell>
                            <TableCell className="text-right text-primary font-bold">${budgetTotal.toFixed(2)}</TableCell>
                            {/* {
                                isEditable &&
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger>
                                            <MoreVert />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={()=>setOpenDiscountDialog(true)}>Agregar descuento</DropdownMenuItem>
                                            <DropdownMenuItem>Agregar impuesto</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            } */}
                        </TableRow>
                    </TableFooter>
                </Table>
                {/* <DiscountEditor onAddDiscount={handleAddDiscount} open={openDiscountDialog} onOpenChange={setOpenDiscountDialog}/> */}
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
                <div>
                    {
                        (quoteValidity && parseFloat(quoteValidity) > 0)  &&
                        <div>
                            <h2 className="text-lg font-semibold text-gray-700 mb-2">Notas y Términos</h2>
                            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-sm text-gray-600">
                                <p>
                                    Este presupuesto es válido por {quoteValidity} {parseFloat(quoteValidity) > 1 ? "días" : "día"} a partir de la fecha indicada.
                                </p>
                            </div>
                        </div>
                    }
                </div>
                <footer className="text-center mt-10 text-sm text-gray-500 border-t pt-6">
                    <p>Gracias por tu confianza. ¡Esperamos trabajar juntos!</p>
                    {
                        sender?.completeName &&
                        <p className="mt-2">{sender.completeName} | {sender.url}</p>
                    }
                </footer>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
                {
                    isEditable &&
                    <Button
                        variant="secondary"
                        onClick={() => setIsEditable(!isEditable)}
                        className="w-full"
                    >
                        Exportar a PDF
                    </Button>
                }
                { 
                    !isEditable &&
                    <div className="flex flex-row space-x-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsEditable(!isEditable)}
                            className="w-full"
                        >
                            <ArrowBack className="w-4 h-4" />
                            <span>Volver a editar</span>
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={handleExportToPdf}
                            className="w-full"
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

export default QuotePreview;

// const DiscountEditor = ({onAddDiscount, open, onOpenChange} : {onAddDiscount?: (discount: Discount) => void, open: boolean, onOpenChange: (open: boolean) => void }) => {
//     const [discount, setDiscount] = useState<Discount>({name: "Descuento", percentage: 0} as Discount);

//     const handleAddDiscount = () => {
//         onAddDiscount && onAddDiscount(discount);
//         onOpenChange(false);
//     }

//     const handleCancel = () => {
//         setDiscount({name: "Descuento", percentage: 0} as Discount);
//         onOpenChange(false);
//     }

//     return (
//         <Dialog open={open} onOpenChange={onOpenChange}>
//                 <DialogContent className="sm:max-w-[425px]">
//                     <DialogHeader>
//                         <DialogTitle>Agregar Descuento</DialogTitle>
//                         <DialogDescription>
//                         Agrega un descuento al total del presupuesto.
//                         </DialogDescription>
//                     </DialogHeader>
//                     <div className="grid gap-4">
//                         <div className="grid gap-3">
//                             <Label htmlFor="name">Nombre</Label>
//                             <Input
//                                 id="name"
//                                 name="name"
//                                 value={discount.name}
//                                 onChange={(e) => {setDiscount({...discount, name: e.target.value})}} />
//                         </div>
//                         <div className="grid gap-3">
//                             <Label htmlFor="percentage">Porcentaje</Label>
//                             <Input
//                                 id="percentage"
//                                 name="percentage"
//                                 value={discount.percentage}
//                                 onChange={(e) => {setDiscount({...discount, percentage: parseFloat(e.target.value ? e.target.value : '0' )})}}/>
//                         </div>
//                     </div>
//                     <DialogFooter>
//                         <DialogClose asChild>
//                         <Button variant="outline" onClick={handleCancel}>Cancel</Button>
//                         </DialogClose>
//                         <Button type="submit" onClick={handleAddDiscount}>Agregar Descuento</Button>
//                     </DialogFooter>
//                 </DialogContent>
//         </Dialog>
//     )
// }

type ClientEditorProps = {
    client: Client;
    setClient: React.Dispatch<React.SetStateAction<Client>>;
};

const ClientEditor = ({client, setClient }: ClientEditorProps) => {
    const [showMore, setShowMore] = useState(false);

    return (
        <Collapsible open={showMore} onOpenChange={setShowMore}>
            <div>
                <Label htmlFor="clientName">Nombre:</Label>
                <Input
                    id="clientName"
                    type="text"
                    value={client?.name || ''}
                    onChange={(e) => setClient({ ...client, name: e.target.value })}
                    placeholder="Nombre del cliente"
                    className="mb-2 w-[280px] bg-white"
                />
            </div>
            <CollapsibleTrigger asChild>
                <div className="flex justify-end">
                    <Button variant="ghost" className="text-muted-foreground hover:bg-transparent hover:text-primary" >
                        {
                            !showMore ?
                            <>
                                <MoreHoriz />
                                <span className="text-xs">mostrar mas</span>
                            </>
                            :
                            <>
                                <ExpandLess />
                                <span className="text-xs">ocultar</span>
                            </>
                        }
                    </Button>
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="flex flex-col gap-2">
                <div>
                    <Label htmlFor="clientAddress">Dirección:</Label>
                    <Input
                        id="clientAddress"
                        type="text"
                        value={client.address || ''}
                        onChange={(e) => setClient({...client, address: e.target.value})}
                        placeholder="Dirección"
                        className="mb-2 w-[280px] bg-white"/>
                </div>
                <div>
                    <Label htmlFor="clientPhone">Phone:</Label>
                    <Input
                        id="clientPhone"
                        type="text"
                        value={client.phone || ''}
                        onChange={(e) => setClient({...client, phone: e.target.value})}
                        placeholder="Teléfono"
                        className="mb-2 w-[280px] bg-white"/>
                </div>
                <div>
                    <Label htmlFor="clientEmail">Email:</Label>
                    <Input
                        id="clientEmail"
                        type="text"
                        value={client.email || ''}
                        onChange={(e) => setClient({...client, email: e.target.value})}
                        placeholder="Email"
                        className="mb-2 w-[280px] bg-white"/>
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}

const SenderEditor = ({sender, setSender }: {sender: Sender, setSender: React.Dispatch<React.SetStateAction<Sender>>}) => {
    const [showMore, setShowMore] = useState(false);
    
    return (
        <Collapsible open={showMore} onOpenChange={setShowMore}>
            <div>
                <Label htmlFor="senderName">Nombre:</Label>
                <Input
                    id="senderName"
                    type="text"
                    value={sender.name || ''}
                    onChange={(e) => setSender({...sender, name: e.target.value})}
                    placeholder="Tu nombre"
                    className="mb-2 w-[280px] bg-white"/>
            </div>
            <CollapsibleTrigger asChild>
                <div className="flex justify-end">
                    <Button variant="ghost" className="text-muted-foreground hover:bg-transparent hover:text-primary" >
                        {
                            !showMore ?
                            <>
                                <MoreHoriz />
                                <span className="text-xs">mostrar mas</span>
                            </>
                            :
                            <>
                                <ExpandLess />
                                <span className="text-xs">ocultar</span>
                            </>
                        }
                    </Button>
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="flex flex-col gap-2">
                <div>
                    <Label htmlFor="senderCompleteName">Nombre completo:</Label>
                    <Input
                        id="senderCompleteName"
                        type="text"
                        value={sender.completeName || ''}
                        onChange={(e) => setSender({...sender, completeName: e.target.value})}
                        placeholder="Nombre completo"
                        className="mb-2 w-[280px] bg-white"/>
                </div>
                <div>
                    <Label htmlFor="senderAddress">Dirección:</Label>
                    <Input
                        id="senderAddress"
                        type="text"
                        value={sender.address || ''}
                        onChange={(e) => setSender({...sender, address: e.target.value})}
                        placeholder="Dirección"
                        className="mb-2 w-[280px] bg-white"/>
                </div>
                <div>
                    <Label htmlFor="senderPhone">Phone:</Label>
                    <Input
                        id="senderPhone"
                        type="text"
                        value={sender.phone || ''}
                        onChange={(e) => setSender({...sender, phone: e.target.value})}
                        placeholder="Teléfono"
                        className="mb-2 w-[280px] bg-white"/>
                </div>
                <div>
                    <Label htmlFor="senderEmail">Email:</Label>
                    <Input
                        id="senderEmail"
                        type="text"
                        value={sender.email || ''}
                        onChange={(e) => setSender({...sender, email: e.target.value})}
                        placeholder="Email"
                        className="mb-2 w-[280px] bg-white"/>
                </div>
                <div>
                    <Label htmlFor="senderUrl">url:</Label>
                    <Input
                        id="senderUrl"
                        type="text"
                        value={sender.url || ''}
                        onChange={(e) => setSender({...sender, url: e.target.value})}
                        placeholder="Email"
                        className="mb-2 w-[280px] bg-white"/>
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}