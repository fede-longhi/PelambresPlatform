"use client"
    
import { useState } from "react";
import PrinterCreateForm from "./create-form";
import { DialogButton } from "@/components/ui/dialog-button";
import { Plus } from "lucide-react";


export function CreatePrinterButton () {
    const [open, setOpen] = useState(false);

    return (
        <DialogButton
            title="Agregar impresora"
            description="Registre una impresora del taller."
            label="Agregar impresora"
            icon={<Plus/>}
            open={open}
            onOpenChange={setOpen}
        >
            <PrinterCreateForm redirectAfterCreate={false} path="/admin/printers" onSuccess={()=>(setOpen(false))} />
        </DialogButton>
    )
}