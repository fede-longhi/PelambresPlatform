import { requireCustomerPortalCourse } from '@/lib/auth/customer-portal';
import { getCourseAccessMessage } from '@/lib/auth/course-access';
import { fetchCourseMaterials } from '@/lib/data/course-material-data';
import { lusitana } from '@/app/fonts';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CourseRegistrationStatusBadges } from '../_components/course-status-badges';
import CourseClassroomContent from '../_components/course-classroom-content';
import { CourseMaterialsSection } from '@/components/education/course-materials-section';
import { Lock } from 'lucide-react';

export default async function CustomerCourseDetailPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const { course } = await requireCustomerPortalCourse(slug);
  const materials = course.canAccessClassroom
    ? await fetchCourseMaterials(course.id)
    : [];
  const accessMessage = getCourseAccessMessage(
    {
      registrationStatus: course.registrationStatus,
      paymentStatus: course.paymentStatus,
    },
    course.price
  );

  return (
    <div className="w-full max-w-3xl">
      <Link href="/customer/courses" className="text-sm text-primary hover:underline">
        ← Volver a mis cursos
      </Link>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className={`${lusitana.className} text-2xl`}>{course.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Aula virtual</p>
        </div>
        <CourseRegistrationStatusBadges
          registrationStatus={course.registrationStatus}
          paymentStatus={course.paymentStatus}
          price={course.price}
        />
      </div>

      {course.canAccessClassroom ? (
        <>
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Información del curso</CardTitle>
            </CardHeader>
            <CardContent>
              <CourseClassroomContent course={course} />
            </CardContent>
          </Card>

          {materials.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Materiales</CardTitle>
              </CardHeader>
              <CardContent>
                <CourseMaterialsSection materials={materials} />
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card className="mt-6 border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <Lock className="h-5 w-5" />
              Aula bloqueada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-amber-900">
            <p>{accessMessage}</p>
            <div className="rounded-lg border border-amber-200 bg-white p-4">
              <p className="font-medium">{course.title}</p>
              <p className="mt-1 text-muted-foreground">{course.shortDescription}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
