import Breadcrumbs from "@/app/(admin)/admin/_components/breadcrumbs";
import CreateForm from "@/app/(admin)/admin/print-jobs/_components/create-form";

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