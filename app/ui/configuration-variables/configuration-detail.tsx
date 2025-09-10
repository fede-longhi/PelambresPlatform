import { ConfigurationVariable } from "@/app/lib/definitions";
import { cn } from "@/lib/utils";

export function ConfigurationItemDetail({configuration, className} : {configuration: ConfigurationVariable, className?: string}) {
    return (
        <div className={cn("flex flex-row", className)}>
            {configuration.key}
        </div>
    )
}