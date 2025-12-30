import React from "react";
import Link from "next/link";
import Image from "next/image";
import { lusitana } from "@/app/ui/fonts";
import { cn } from "@/lib/utils";
import { BookOpen, ExternalLink} from "lucide-react";

interface SectionHeaderProps {
    title: string;
    icon?: React.ReactNode; // Permite pasar cualquier componente o elemento React como icono
}

export function SectionHeader({ title, icon }: SectionHeaderProps) {
    return (
        <header className={cn(`${lusitana.className} flex items-center pb-6 pt-4 px-4 rounded-t-md mb-6 shadow-sm rounded-t-md`)}>
            <div className="mr-3 text-primary">
                {icon ? icon : <BookOpen className="w-6 h-6" />}
            </div>

            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                {title}
            </h2>
        </header>
    );
}


export function Header({title, className} : {title: string, className?: string}) {
    return (
        <h1 className={cn(`${lusitana.className} text-center font-medium text-[44px] mb-12`, className)}>
            {title}
        </h1>   
    )
}

// export function SectionHeader({title, className} : {title?: string, className?: string}) {
//     return (
//         <h2 className={cn(`${lusitana.className} font-medium text-[32px] bg-primary text-primary-foreground p-2 px-8 mb-2`, className)}>
//             {title}
//         </h2>
//     );
// }

const Section = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "bg-white",
      className
    )}
    {...props}
  />
))
Section.displayName = "Section"

const SectionContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "p-4",
      className
    )}
    {...props}
  />
))
SectionContent.displayName = "SectionContent"

interface ExternalLinkButtonProps {
    href: string;
    name: string;
    description?: string;
    domain: string;
};
  
export function ExternalLinkButton({
    href,
    name,
    description,
    domain,
}: ExternalLinkButtonProps) {
    return (
      <Link
        href={href}
        target="_blank"
        className="flex flex-row border border-primary rounded-md items-center p-2 space-x-2 hover:bg-primary/10 transition"
      >
        <div className="flex flex-col md:flex-row md:items-center">
            <span className="flex flex-row items-center">
                <Image
                src={`https://www.google.com/s2/favicons?domain=${domain}`}
                alt={`${name}-icon`}
                width={16}
                height={16}
                className="w-4 h-4 mr-2"
                />
                {name}
            </span>
            {
                description &&
                <span className="text-gray-500 text-sm md:ml-4">{description}</span>
            }
        </div>
        <span className="flex-1" />
        <ExternalLink />
      </Link>
    );
}

export {Section, SectionContent}