import React, { useState } from "react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MoreHoriz from "@mui/icons-material/MoreHoriz";
import ExpandLess from "@mui/icons-material/ExpandLess";
import type { Sender } from "@/types/definitions";

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
                        placeholder="Url"
                        className="mb-2 w-[280px] bg-white"/>
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}

export default SenderEditor;