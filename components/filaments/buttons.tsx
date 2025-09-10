"use client"

import { useState } from "react";
import { DialogButton } from "../ui/dialog-button";

export function CreateFilamentButton () {
    const [open, setOpen] = useState(false);

    return (
        <DialogButton
            title="Add Filament"
            description="Add a new filament to your collection."
            label="Add Filament"
            open={open}
            onOpenChange={setOpen}
        >
            Filamento
        </DialogButton>
    )
}