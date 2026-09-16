"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import CreateConfigurationForm from "@/app/(admin)/admin/configuration/_components/create-form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pencil, Plus } from "lucide-react";
import { ConfigurationVariable } from "@/types/definitions";
import EditConfigurationForm from "@/app/(admin)/admin/configuration/_components/edit-form";

export function CreateConfigurationButton() {
    const [open, setOpen] = useState(false);
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 size-4" aria-hidden="true" />
                    Agregar variable
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                <DialogTitle>Nueva variable</DialogTitle>
                <DialogDescription>
                    Agregue una variable de configuración.
                </DialogDescription>
                </DialogHeader>

                <CreateConfigurationForm onSuccess={()=>(setOpen(false))} />
            
            </DialogContent>
        </Dialog>
    )
}

export function EditValueButton({configuration} : {configuration: ConfigurationVariable}) {
    const [open, setOpen] = useState(false);
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0 size-11 md:size-9"
                  aria-label="Editar variable"
                >
                    <Pencil aria-hidden="true" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                <DialogTitle>Editar {configuration.key}</DialogTitle>
                <DialogDescription>
                    Cambie el valor de la variable de configuración.
                </DialogDescription>
                </DialogHeader>

                <EditConfigurationForm configuration={configuration} onSuccess={()=>(setOpen(false))} />
            
            </DialogContent>
        </Dialog>
    )
}