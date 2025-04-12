import { lusitana } from "@/app/ui/fonts";
import { cn } from "@/lib/utils";

export default function PageHeader({ className, title }: { className?: string; title: string; }){
    return (
        <div className={cn("flex w-full items-center justify-between", className)}>
            <h1 className={`${lusitana.className} text-2xl`}>{title}</h1>
        </div>
    )
}