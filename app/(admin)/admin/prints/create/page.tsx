import Breadcrumbs from "@/app/ui/breadcrumbs";
import CreateForm from "@/app/ui/prints/create-form";

export default function Page() {
    return (
        <main>
            <Breadcrumbs
            breadcrumbs={[
              { label: 'Prints', href: '/admin/prints' },
              {
                label: 'Create Print',
                href: '/admin/prints/create',
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