import { requireCustomerPortalContext } from '@/lib/auth/customer-portal';
import { fetchCustomerCourses } from '@/lib/data/customer-course-data';
import { lusitana } from '@/app/fonts';
import Link from 'next/link';
import { CourseRegistrationStatusBadges } from './_components/course-status-badges';
import { COURSE_MODALITIES } from '@/lib/consts/course-consts';
import { Button } from '@/components/ui/button';

export default async function CustomerCoursesPage() {
  const { userId } = await requireCustomerPortalContext();
  const courses = await fetchCustomerCourses(userId);

  return (
    <div className="w-full max-w-4xl">
      <h1 className={`${lusitana.className} text-2xl`}>Mis cursos</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Cursos en los que estás inscripto y el estado de tu acceso al aula.
      </p>

      <div className="mt-6">
        {courses.length === 0 ? (
          <div className="rounded-lg bg-gray-50 p-8 text-center text-sm text-muted-foreground">
            <p>No tenés cursos inscriptos todavía.</p>
            <Button asChild variant="link" className="mt-2">
              <Link href="/education">Ver cursos disponibles</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {courses.map((course) => {
              const modalityLabel =
                COURSE_MODALITIES.find((item) => item.value === course.modality)?.label ??
                course.modality;

              return (
                <Link
                  key={course.registrationId}
                  href={`/customer/courses/${course.slug}`}
                  className="block rounded-lg border bg-white p-4 transition-colors hover:bg-gray-50"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{course.title}</p>
                      <p className="text-sm text-muted-foreground">{course.shortDescription}</p>
                      <p className="text-xs text-muted-foreground">
                        {modalityLabel} · {course.duration}
                      </p>
                    </div>
                    <CourseRegistrationStatusBadges
                      registrationStatus={course.registrationStatus}
                      paymentStatus={course.paymentStatus}
                      price={course.price}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
