"use client"

import { Button } from "./button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";
import { ReactElement, ReactNode, SVGProps } from "react";

type DialogButtonProps = {
    children?: ReactNode;
    icon?: ReactElement<SVGProps<SVGSVGElement>>;
    label?:string;
    title?: string;
    description?: string;
    variant?: "default" | "outline" | "ghost" | "link" | "destructive";
    size?: "default" | "sm" | "lg" | "icon";
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
};

export function DialogButton ({
    children,
    icon,
    label,
    title,
    description,
    variant = "default",
    size = "default",
    open,
    onOpenChange,
}: DialogButtonProps) {

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button variant={variant} size={size}>{icon} {label}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    {
                        title &&
                        <DialogTitle>{title}</DialogTitle>
                    }
                    {
                        description &&
                        <DialogDescription>
                            {description}
                        </DialogDescription>
                    }
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    )
}