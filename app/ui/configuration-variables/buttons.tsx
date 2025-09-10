"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import CreateConfigurationForm from "@/app/ui/configuration-variables/create-form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pencil, Plus } from "lucide-react";
import { ConfigurationVariable } from "@/app/lib/definitions";
import EditConfigurationForm from "./edit-form";

export function CreateConfigurationButton() {
    const [open, setOpen] = useState(false);
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button> <Plus />Add Configuration</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                <DialogTitle>Add Variable</DialogTitle>
                <DialogDescription>
                    Add a new configuration variable.
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
                <Button variant="outline" size="icon"><Pencil/></Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                <DialogTitle>Edit {configuration.key} Value</DialogTitle>
                <DialogDescription>
                    Change the value of the configuration
                </DialogDescription>
                </DialogHeader>

                <EditConfigurationForm configuration={configuration} onSuccess={()=>(setOpen(false))} />
            
            </DialogContent>
        </Dialog>
    )
}