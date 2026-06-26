import Link from 'next/link';
import { Plus, Pencil, Trash2, Eye, EyeOff, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import sql from '@/lib/db';
import { DeleteCourseButton } from './delete-course-button';

export default async function AdminCoursesPage() {
    const courses = await sql`
        SELECT 
            c.id, 
            c.title, 
            c.slug, 
            c.duration, 
            c.is_published as "isPublished",
            COUNT(r.id)::int as registrations
        FROM courses c
        LEFT JOIN course_registrations r ON c.id = r.course_id
        WHERE c.deleted_at IS NULL
        GROUP BY c.id
        ORDER BY c.created_at DESC
    `

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
            
            {/* Header del Panel */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Gestión de Cursos</h1>
                    <p className="text-slate-500 mt-1">Administra tu oferta educativa y las inscripciones.</p>
                </div>
                {/* Botón para crear un curso nuevo (te llevará al formulario) */}
                <Link href="/admin/courses/new">
                    <Button className="shrink-0">
                        <Plus className="mr-2" size={18} /> Nuevo Curso
                    </Button>
                </Link>
            </div>

            {/* Tabla de Cursos */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Curso</th>
                                <th className="px-6 py-4 font-semibold">Estado</th>
                                <th className="px-6 py-4 font-semibold text-center">Inscriptos</th>
                                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {courses.map((course) => (
                                <tr key={course.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <Link href={`/admin/courses/${course.id}`} className="hover:underline group">
                                            <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                                                {course.title}
                                            </p>
                                        </Link>
                                        <p className="text-slate-500 text-xs mt-0.5">/{course.slug}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        {course.isPublished ? (
                                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none">
                                                <Eye className="mr-1" size={12} /> Publicado
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-slate-500 bg-slate-100 border-none">
                                                <EyeOff className="mr-1" size={12} /> Borrador
                                            </Badge>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Link href={`/admin/courses/${course.id}/registrations`} title="Ver inscriptos">
                                            <span className="inline-flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 transition-colors cursor-pointer font-bold px-3 py-1 rounded-full border border-blue-200">
                                                {course.registrations} <Users size={14} className="ml-1.5 opacity-70" />
                                            </span>
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/admin/courses/${course.id}/edit`}>
                                                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600">
                                                    <Pencil size={18} />
                                                </Button>
                                            </Link>
                                            
                                            <DeleteCourseButton courseId={course.id} courseTitle={course.title} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {courses.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                        Todavía no hay cursos creados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}