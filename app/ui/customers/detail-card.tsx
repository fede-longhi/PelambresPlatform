import { Customer } from "@/types/definitions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditCustomerButton } from "./buttons";

export default function CustomerDetailCard({customer, className} : {customer: Customer, className?: string}) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center">
                    Details
                    <span className="flex-1"/>
                    <EditCustomerButton id={customer.id} />
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                {
                    customer.type == 'business' && 
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-500">Name</span>
                        <span>{customer.name}</span>
                    </div>

                }
                {
                    customer.type == 'person' && 
                    <>
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-500">First Name</span>
                            <span>{customer.first_name}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-500">Last Name</span>
                            <span>{customer.last_name}</span>
                        </div>
                    </>
                }
                <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Email</span>
                    <span>{customer.email}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Phone</span>
                    <span>{customer.phone}</span>
                </div>
            </CardContent>
        </Card>
    );
}