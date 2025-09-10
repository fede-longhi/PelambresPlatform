import { ConfigurationVariable } from "@/app/lib/definitions";
import { cn } from "@/lib/utils";
import ConfigurationTable from "./confiuguration-table";

export default function ConfigurationList(
    {configurationVariables, className}:
    {configurationVariables: Record<string, ConfigurationVariable[]>, className?: string}
) {
    return (
        <div className={cn("flex flex-col space-y-4", className)}>
            {
                Object.entries(configurationVariables).map(([key, value]) => (
                    <div key={key} className="">
                        <h1 className="text-lg font-medium">{key}</h1>
                        <ConfigurationTable configurations={value} />
                    </div>
                ))
            }
        </div>
    )
}