import Breadcrumbs from "@/app/ui/breadcrumbs";
import CreateForm from "@/app/ui/print-jobs/create-form";

export default function Page() {
    
    return (
        <main>
            <Breadcrumbs
            breadcrumbs={[
              { label: 'Print Jobs', href: '/admin/print-jobs' },
              {
                label: 'Create Print Job',
                href: '/admin/print-jobs/create',
                active: true,
              },
            ]}
            />
            <div className="flex w-full">
                <div className="flex justify-center">
                    <CreateForm />
                </div>
            </div>
        </main>
    )
}