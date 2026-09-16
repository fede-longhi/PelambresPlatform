import { getConfigurationGroupedByCategory } from "@/lib/data/configuration-data";
import { CreateConfigurationButton } from "@/app/(admin)/admin/configuration/_components/buttons";
import ConfigurationList from "@/app/(admin)/admin/configuration/_components/configuration-list";
import PageHeader from "@/components/ui/page-header";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Configuración',
};

export default async function Page() {
    const configurations = await getConfigurationGroupedByCategory();
    const hasConfigurations = Object.keys(configurations).length > 0;

    return (
        <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <PageHeader title="Configuración" />
                <CreateConfigurationButton />
            </div>
            <p className="mt-2 mb-6 text-sm text-muted-foreground">
                Variables internas de cotización y operación.
            </p>

            {hasConfigurations ? (
                <ConfigurationList configurationVariables={configurations} />
            ) : (
                <div className="rounded-lg bg-gray-50 p-8 text-center text-sm text-muted-foreground">
                    No hay variables de configuración.
                </div>
            )}
        </div>
    )
}