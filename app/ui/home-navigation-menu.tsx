import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

export default function HomeNavigationMenu() {
    const isProduction = process.env.IS_PRODUCTION === 'true';

    return (
        <NavigationMenu className="hidden md:flex bg-primary justify-end max-w-full p-2 sticky top-0">
            <NavigationMenuList>
                <NavigationMenuItem>
                    <Link href="/quote-request" legacyBehavior passHref>
                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            Cotizá
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <Link href="/print-status" legacyBehavior passHref>
                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            Mi pedido
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <Link href="/print-guide" legacyBehavior passHref>
                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            Guia de Impresión
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <Link href="/tools" legacyBehavior passHref>
                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            Herramientas
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
                <span className="flex-1" />
                {
                    !isProduction &&
                    <>
                        <Link href="/login" legacyBehavior passHref>
                            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            Login <ArrowRightIcon className="w-5 md:w-6 ml-2" />
                            </NavigationMenuLink>
                        </Link>
                    </>
                }
            </NavigationMenuList>
        </NavigationMenu>
    )
}