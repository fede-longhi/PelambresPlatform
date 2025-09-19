import React, { useState } from "react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MoreHoriz from "@mui/icons-material/MoreHoriz";
import ExpandLess from "@mui/icons-material/ExpandLess";
import type { Client } from "@/app/lib/definitions";


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

export default ClientEditor;