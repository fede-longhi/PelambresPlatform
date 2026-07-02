import { Calendar, Clock, MapPin, Users, Banknote, Info } from 'lucide-react';
import { COURSE_MODALITIES, CURRENCIES, COURSE_LEVELS } from '@/lib/consts/course-consts';
import type { CustomerCourseDetail } from '@/lib/data/customer-course-data';

export default function CourseClassroomContent({ course }: { course: CustomerCourseDetail }) {
  const bulletPoints = course.learningOutcomes
    ? course.learningOutcomes.split('\n').filter((line) => line.trim() !== '')
    : [];

  const modalityLabel =
    COURSE_MODALITIES.find((item) => item.value === course.modality)?.label ?? course.modality;
  const levelLabel =
    COURSE_LEVELS.find((item) => item.value === course.level)?.label ?? course.level;
  const currencyLabel =
    CURRENCIES.find((item) => item.value === course.currency)?.label ?? course.currency;

  const formattedDate = course.startDate
    ? new Date(course.startDate).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : null;

  const numericPrice = Number(course.price);
  const formattedPrice =
    numericPrice > 0
      ? `${currencyLabel} ${numericPrice.toLocaleString('es-AR', { minimumFractionDigits: 0 })}`
      : 'Gratis';

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            {modalityLabel}
          </span>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Nivel {levelLabel}
          </span>
        </div>
        <p className="mt-4 text-muted-foreground">{course.shortDescription}</p>
      </div>

      {course.learningObjective && (
        <section>
          <h2 className="text-lg font-semibold">Objetivo del curso</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {course.learningObjective}
          </p>
        </section>
      )}

      {bulletPoints.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold">¿Qué vas a aprender?</h2>
          <ul className="mt-3 space-y-2">
            {bulletPoints.map((point) => (
              <li key={point} className="flex gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {point}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {formattedDate && (
          <div className="flex items-start gap-3 rounded-lg border bg-white p-4">
            <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Fecha de inicio</p>
              <p className="text-sm text-muted-foreground">{formattedDate}</p>
            </div>
          </div>
        )}

        {course.schedule && (
          <div className="flex items-start gap-3 rounded-lg border bg-white p-4">
            <Clock className="mt-0.5 h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Horario</p>
              <p className="text-sm text-muted-foreground">{course.schedule}</p>
            </div>
          </div>
        )}

        {course.location && (
          <div className="flex items-start gap-3 rounded-lg border bg-white p-4">
            <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Ubicación</p>
              <p className="text-sm text-muted-foreground">{course.location}</p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3 rounded-lg border bg-white p-4">
          <Users className="mt-0.5 h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Cupo máximo</p>
            <p className="text-sm text-muted-foreground">{course.maxStudents} estudiantes</p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-lg border bg-white p-4">
          <Banknote className="mt-0.5 h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Inversión</p>
            <p className="text-sm text-muted-foreground">{formattedPrice}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-lg border bg-white p-4">
          <Clock className="mt-0.5 h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Duración</p>
            <p className="text-sm text-muted-foreground">{course.duration}</p>
          </div>
        </div>
      </section>

      {course.notes && (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex gap-2">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
            <div>
              <p className="text-sm font-medium text-amber-900">Información adicional</p>
              <p className="mt-1 whitespace-pre-line text-sm text-amber-800">{course.notes}</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
