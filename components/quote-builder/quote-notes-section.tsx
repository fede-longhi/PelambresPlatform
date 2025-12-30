import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import {Add as AddIcon, Delete, VisibilityOff} from "@mui/icons-material";
import type { QuoteInfo } from "@/types/definitions";

export type NotesSection = {
    visible: boolean;
    extraNotes: string | undefined;
    showAddMoreNotes: boolean;
}

const NotesSection = ({isEditable, quoteInfo}:{isEditable:boolean, quoteInfo: QuoteInfo}) => {
    const [notesSection, setNotesSection] = useState({visible: true, extraNotes: "", showAddMoreNotes: false} as NotesSection);
    return (
        <div>
            {
                notesSection.visible ?
                <div>
                    <div className="flex flex-row items-center mb-2">
                        <h2 className="text-lg font-semibold text-gray-700 mr-2">Notas y Términos</h2>
                        {
                            isEditable &&
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        className="hover:bg-transparent hover:text-primary text-muted-foreground"
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => setNotesSection({...notesSection, visible: false})}
                                    >
                                        <VisibilityOff />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Ocultar sección</p>
                                </TooltipContent>
                            </Tooltip>
                        }

                    </div>
                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-sm text-gray-600">
                        {
                            (quoteInfo.quoteValidity && parseFloat(quoteInfo.quoteValidity) > 0) &&
                            <p>
                                Este presupuesto es válido por {quoteInfo.quoteValidity} {parseFloat(quoteInfo.quoteValidity) > 1 ? "días" : "día"} a partir de la fecha indicada.
                            </p>
                        }
                        {
                            (notesSection.extraNotes && notesSection.showAddMoreNotes && !isEditable) && 
                            <p>
                                {notesSection.extraNotes}
                            </p>
                        }
                        {
                            (isEditable && !notesSection.showAddMoreNotes) &&
                            <div className="flex justify-center">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button size="icon" variant="ghost" onClick={() => setNotesSection({...notesSection, showAddMoreNotes: true})}>
                                            <AddIcon />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Agregar más notas</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        }
                        {
                            (isEditable && notesSection.showAddMoreNotes) &&
                            <div className="flex flex-row items-center">
                                <Textarea value={notesSection.extraNotes} onChange={(e)=>setNotesSection({...notesSection, extraNotes: e.target.value})}></Textarea>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            className="hover:bg-transparent hover:text-primary"
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => setNotesSection({...notesSection, showAddMoreNotes: false})}
                                        >
                                            <Delete />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Eliminar notas adicionales</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        }
                    </div>
                </div>
                :
                isEditable && 
                <Button
                    className="hover:bg-transparent hover:text-primary"
                    variant="ghost"
                    onClick={() => setNotesSection({...notesSection, visible: true})}
                >
                    <AddIcon />
                    <span>Agregar sección notas y términos</span>
                </Button>
            }
        </div>
    );
}

export default NotesSection;
