import { useState } from "react";
import { Button } from "@/components/ui/button";
import { QuoteInfo } from "@/types/definitions";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Add, Delete, Done, Edit } from "@mui/icons-material";


type QuoteFooterInfo = {
    description: string,
    showDescription: boolean,
    showSignature: boolean
}

const QuoteFooter = ({ isEditable, quoteInfo } : { isEditable: boolean, quoteInfo : QuoteInfo }) => {
    const [footerInfo, setFooterInfo] = useState<QuoteFooterInfo>({
        description: "Gracias por tu confianza. ¡Esperamos trabajar juntos!",
        showDescription: true,
        showSignature: true,
    });

    const [isDescriptionEditing, setIsDescriptionEditing] = useState(false);

    return (
        <footer className="text-center mt-10 text-sm text-gray-500 border-t pt-6">
            {
                (isDescriptionEditing && isEditable) ?
                <div className="flex flex-row items-center mb-2">
                    <Textarea
                        value={footerInfo.description}
                        onChange={(e) => setFooterInfo({...footerInfo, description: e.target.value})}>
                    </Textarea>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button className="ml-2" size="icon" variant="ghost" onClick={()=>setIsDescriptionEditing(false)}>
                                <Done />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Terminar edición</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
                :
                (
                    <div className="flex flex-row items-center justify-center">
                        <p className="text-center">
                            {footerInfo.description}
                        </p>
                        {
                            isEditable && 
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button 
                                        className="ml-2"
                                        size="icon"
                                        variant="ghost"
                                        onClick={()=>setIsDescriptionEditing(true)}
                                    >
                                        <Edit />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Editar saludo</p>
                                </TooltipContent>
                            </Tooltip>
                        }
                    </div>

                )
            }

            <div className="flex flex-row items-center justify-center">
                {
                    (footerInfo.showSignature && quoteInfo.sender.completeName) &&
                    <p className="mt-2">{ quoteInfo.sender.completeName + (quoteInfo.sender.url ? " | " + quoteInfo.sender.url : "")}</p>
                }
                {
                    isEditable &&
                    (footerInfo.showSignature ?
                        quoteInfo.sender.completeName &&
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    className="ml-2"
                                    size="icon"
                                    variant="ghost"
                                    onClick={()=>setFooterInfo({...footerInfo, showSignature: false})}
                                >
                                    <Delete />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Borrar firma</p>
                            </TooltipContent>
                        </Tooltip>
                        :
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button className="ml-2" size="icon" variant="ghost" onClick={()=>setFooterInfo({...footerInfo, showSignature: true})}>
                                    <Add />
                                </Button>
                                </TooltipTrigger>
                            <TooltipContent>
                                <p>Agregar firma</p>
                            </TooltipContent>
                        </Tooltip>
                    )
                }
            </div>
        </footer>
    );
}

export default QuoteFooter;