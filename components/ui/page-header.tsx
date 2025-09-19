import { lusitana } from "@/app/ui/fonts";
import { cn } from "@/lib/utils";

export default function PageHeader({ className, title, textClassName }: { className?: string; title: string; textClassName?: string }){
    return (
        <div className={cn("flex w-full items-center justify-between", className)}>
            <h1 className={cn(`${lusitana.className} text-2xl`, textClassName)}>{title}</h1>
        </div>
    )
}