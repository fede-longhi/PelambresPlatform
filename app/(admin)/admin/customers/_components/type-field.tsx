import { CustomerType } from "@/types/definitions";
import { Badge } from "@/components/ui/badge";
import { Building2, User } from "lucide-react";

export default function CustomerTypeField({type} : {type: CustomerType}) {
    return (
        <Badge variant="secondary" className="flex mt-1 capitalize w-fit">
            {type === 'person' && <User className="h-4 w-4"/>}
            {type === 'business' && <Building2 className="h-4 w-4"/>}
            {type}
        </Badge>
    );
}