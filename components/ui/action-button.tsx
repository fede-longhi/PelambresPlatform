import { Button } from "./button";
import { type ReactNode } from "react";

type ActionButtonProps = {
    action: (id: string) => void;
    id: string;
    children?: ReactNode;
    variant?: "default" | "outline" | "ghost" | "link" | "destructive";
    size?: "default" | "sm" | "lg" | "icon";
};

export function ActionButton({
    action,
    id,
    children,
    variant = "outline",
    size = "icon",
}: ActionButtonProps) {
    const boundAction = action.bind(null, id);

    return (
        <form action={boundAction}>
            <Button type="submit" variant={variant} size={size}>
                {children}
            </Button>
        </form>
    );
}