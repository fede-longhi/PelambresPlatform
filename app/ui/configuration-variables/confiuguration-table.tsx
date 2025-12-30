import { ConfigurationVariable } from "@/types/definitions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTimeToLocal } from "@/lib/utils";
import { EditValueButton } from "./buttons";
import { ActionButton } from "@/components/ui/action-button";
import { Trash } from "lucide-react";
import { deleteConfiguration } from "@/app/lib/configuration-actions";

export default function ConfigurationTable({configurations, className} : {configurations: ConfigurationVariable[], className?: string}) {
    return (
        <Table className={className}>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[200px]">Key</TableHead>
                    <TableHead className="w-[200px]">Value</TableHead>
                    <TableHead>Data Type</TableHead>
                    <TableHead>Created at</TableHead>
                    <TableHead>Last modified at</TableHead>
                    <TableHead></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {
                    configurations.map((configuration) => {
                        return (
                            <TableRow key={configuration.key}>
                                <TableCell>{configuration.key}</TableCell>
                                <TableCell>{configuration.value}</TableCell>
                                <TableCell>{configuration.data_type}</TableCell>
                                <TableCell>{formatDateTimeToLocal(configuration.created_at, 'es-AR')}</TableCell>
                                <TableCell>{formatDateTimeToLocal(configuration.last_modified, 'es-AR')}</TableCell>
                                <TableCell className="flex flex-row space-x-2">
                                    <EditValueButton configuration={configuration} />
                                    <ActionButton id={configuration.id} action={deleteConfiguration}> <Trash /> </ActionButton>
                                </TableCell>
                            </TableRow>
                        );
                    })
                }
            </TableBody>
        </Table>
    );
}