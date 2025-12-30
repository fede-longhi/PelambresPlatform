import Image from "next/image";
import Link from "next/link";
import { Tag } from "lucide-react";
import PageHeader from "@/components/ui/page-header";

interface Project {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    tags: string[];
    slug: string;
}

const featuredProjects: Project[] = [
    {
        id: "p001",
        title: "Pieza de Ingeniería de Alto Rendimiento",
        description: "Un prototipo complejo para la industria automotriz fabricado en PETG, destacando nuestra precisión en tolerancias ajustadas.",
        imageUrl: "/images/projects/engineering_part.jpg",
        tags: ["PETG", "Funcional", "Industrial"],
        slug: "pieza-ingenieria-alto-rendimiento",
    },
    {
        id: "p002",
        title: "Diseño de Figura Articulada",
        description: "Una figura de acción personalizada con múltiples puntos de articulación, impresa en resina para un acabado detallado y suave.",
        imageUrl: "/images/projects/articulated_figure.jpg",
        tags: ["Resina", "Hobby", "Detalle"],
        slug: "figura-articulada-personalizada",
    },
    {
        id: "p003",
        title: "Carcasa Electrónica Modular",
        description: "Diseño y fabricación de una carcasa para PCB, con ajustes modulares para futuras expansiones del circuito.",
        imageUrl: "/images/projects/modular_case.jpg",
        tags: ["PLA", "Electrónica", "Prototipo"],
        slug: "carcasa-electronica-modular",
    },
];

export default function Page() {

    return (
        <div className="flex justify-center py-10 w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <PageHeader 
                    className="my-8 justify-center"
                    textClassName="text-4xl text-center" 
                    title="Nuestros Proyectos de Impresión 3D"
                />
                <p className="text-xl text-center text-muted-foreground max-w-3xl mx-auto mb-12">
                    Explora nuestra galería de trabajos terminados, desde prototipos industriales hasta diseños artísticos personalizados.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featuredProjects.map((project) => (
                        <Link 
                            key={project.id} 
                            href={`/projects/${project.slug}`}
                            className="group block rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-white border border-gray-100"
                        >
                            <div className="relative w-full h-48 overflow-hidden">
                                <Image
                                    src={project.imageUrl}
                                    alt={project.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    priority={false} 
                                />
                            </div>

                            <div className="p-5">
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition">
                                    {project.title}
                                </h3>
                                <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                                    {project.description}
                                </p>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    {project.tags.map((tag) => (
                                        <span 
                                            key={tag} 
                                            className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                                        >
                                            <Tag className="w-3 h-3 mr-1" />
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
                
                <div className="text-center mt-16">
                    <Link href="/quote-request" className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-base font-medium text-primary-foreground shadow-lg transition hover:bg-primary/90">
                        ¿Tienes un proyecto en mente? ¡Cotiza con nosotros!
                    </Link>
                </div>
            </div>
        </div>
    );

}