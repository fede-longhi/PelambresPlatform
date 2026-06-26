import { getConfigurationGroupedByCategory } from "@/lib/data/configuration-data";
import { CreateConfigurationButton } from "@/app/(admin)/admin/configuration/_components/buttons";
import ConfigurationList from "@/app/(admin)/admin/configuration/_components/configuration-list";
import PageHeader from "@/components/ui/page-header";


export default async function Page() {

    
    const configurations = await getConfigurationGroupedByCategory();

    return (
        <div>
            <PageHeader title="Configuration" className="mb-6" />
            
            <CreateConfigurationButton />
            
            <ConfigurationList configurationVariables={configurations} className="mt-6"/>
        </div>
    )
}