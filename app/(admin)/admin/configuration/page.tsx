import { getConfigurationGroupedByCategory } from "@/app/lib/configuration-data";
import { CreateConfigurationButton } from "@/app/ui/configuration-variables/buttons";
import ConfigurationList from "@/app/ui/configuration-variables/configuration-list";
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