"use client"
    
import { useState } from "react";
import PrinterCreateForm from "./create-form";
import { DialogButton } from "../ui/dialog-button";
import { Plus } from "lucide-react";


export function CreatePrinterButton () {
    const [open, setOpen] = useState(false);

    return (
        <DialogButton
            title="Add Printer"
            description="Add a new printer to your collection."
            label="Add Printer"
            icon={<Plus/>}
            open={open}
            onOpenChange={setOpen}
        >
            <PrinterCreateForm redirectAfterCreate={false} path="/admin/printers" onSuccess={()=>(setOpen(false))} />
        </DialogButton>
    )
}