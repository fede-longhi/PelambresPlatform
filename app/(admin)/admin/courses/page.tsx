import Link from 'next/link';
import type { Metadata } from 'next';
import { Plus, Pencil, Eye, EyeOff, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/ui/page-header';
import { fetchAdminCourses } from '@/lib/data/course-data';
import { DeleteCourseButton } from './delete-course-button';

export const metadata: Metadata = {
  title: 'Cursos',
};

export default async function AdminCoursesPage() {
  const courses = await fetchAdminCourses();

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Cursos" />
        <Button asChild>
          <Link href="/admin/courses/new">
            <Plus className="mr-2 size-4" aria-hidden="true" />
            Nuevo curso
          </Link>
        </Button>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Oferta educativa, publicación e inscripciones.
      </p>

      {courses.length === 0 ? (
        <div className="mt-6 rounded-lg bg-gray-50 p-8 text-center text-sm text-muted-foreground">
          Todavía no hay cursos creados.
        </div>
      ) : (
        <div className="mt-6">
          <div className="md:hidden">
            {courses.map((course) => (
              <div key={course.id} className="mb-2 rounded-md border bg-white p-4">
                <div className="flex items-start justify-between gap-3 border-b pb-3">
                  <div className="min-w-0">
                    <Link
                      href={`/admin/courses/${course.id}`}
                      className="font-medium hover:underline"
                    >
                      {course.title}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">
                      /{course.slug}
                    </p>
                  </div>
                  {course.isPublished ? (
                    <Badge>
                      <Eye className="mr-1 size-3" aria-hidden="true" />
                      Publicado
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <EyeOff className="mr-1 size-3" aria-hidden="true" />
                      Borrador
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 pt-3">
                  <Link
                    href={`/admin/courses/${course.id}/registrations`}
                    className="text-sm text-primary hover:underline"
                  >
                    {course.registrations} inscriptos
                  </Link>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" asChild className="size-11 md:size-9">
                      <Link
                        href={`/admin/courses/${course.id}/edit`}
                        aria-label={`Editar ${course.title}`}
                      >
                        <Pencil className="size-4" aria-hidden="true" />
                      </Link>
                    </Button>
                    <DeleteCourseButton courseId={course.id} courseTitle={course.title} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-lg border bg-white md:block">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Curso</th>
                  <th scope="col" className="px-4 py-3 font-medium">Estado</th>
                  <th scope="col" className="px-4 py-3 font-medium text-center">Inscriptos</th>
                  <th scope="col" className="px-4 py-3 font-medium text-right">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id} className="border-t">
                    <td className="px-4 py-3">
                      <Link href={`/admin/courses/${course.id}`} className="hover:underline">
                        <p className="font-medium text-foreground">{course.title}</p>
                      </Link>
                      <p className="text-xs text-muted-foreground">/{course.slug}</p>
                    </td>
                    <td className="px-4 py-3">
                      {course.isPublished ? (
                        <Badge>
                          <Eye className="mr-1 size-3" aria-hidden="true" />
                          Publicado
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <EyeOff className="mr-1 size-3" aria-hidden="true" />
                          Borrador
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        href={`/admin/courses/${course.id}/registrations`}
                        className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm hover:bg-muted"
                      >
                        {course.registrations}
                        <Users size={14} aria-hidden="true" />
                        <span className="sr-only">inscriptos</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" asChild className="size-11 md:size-9">
                          <Link
                            href={`/admin/courses/${course.id}/edit`}
                            aria-label={`Editar ${course.title}`}
                          >
                            <Pencil className="size-4" aria-hidden="true" />
                          </Link>
                        </Button>
                        <DeleteCourseButton courseId={course.id} courseTitle={course.title} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
