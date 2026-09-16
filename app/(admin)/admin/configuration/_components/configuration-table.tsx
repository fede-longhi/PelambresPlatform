import { ConfigurationVariable } from "@/types/definitions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTimeToLocal } from "@/lib/utils";
import { EditValueButton } from "./buttons";
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete-button";
import { deleteConfiguration } from "@/lib/actions/configuration-actions";

export default function ConfigurationTable({configurations, className} : {configurations: ConfigurationVariable[], className?: string}) {
    return (
        <Table className={className}>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[200px]">Clave</TableHead>
                    <TableHead className="w-[200px]">Valor</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Creada</TableHead>
                    <TableHead>Última modificación</TableHead>
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
                                    <ConfirmDeleteButton
                                        ariaLabel={`Eliminar ${configuration.key}`}
                                        title="Eliminar variable"
                                        description={`Se eliminará la variable ${configuration.key}.`}
                                        action={deleteConfiguration.bind(null, configuration.id)}
                                    />
                                </TableCell>
                            </TableRow>
                        );
                    })
                }
            </TableBody>
        </Table>
    );
}
