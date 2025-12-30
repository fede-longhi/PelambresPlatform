

export default function PageHeader({ title, coloredTitle, description }: { title: string, coloredTitle?: string, description?: string }) {
    return(
        <header className="mb-12 text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl tracking-tight">
                {title} {coloredTitle && <span className="text-primary">{coloredTitle}</span>}
            </h1>
            {
                description &&
                <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
                    {description}
                </p>
            }
        </header>
    );
}