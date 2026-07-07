import sql from '@/lib/db';
import { canAccessCourseClassroom } from '@/lib/auth/course-access';

export type CustomerCourseRegistration = {
  registrationId: string;
  registrationStatus: string;
  paymentStatus: string;
  courseId: string;
  title: string;
  slug: string;
  shortDescription: string;
  duration: string;
  level: string;
  modality: string;
  startDate: string | null;
  price: number;
  currency: string;
  canAccessClassroom: boolean;
};

export type CustomerCourseDetail = {
  registrationId: string;
  registrationStatus: string;
  paymentStatus: string;
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  duration: string;
  level: string;
  learningObjective: string | null;
  learningOutcomes: string | null;
  modality: string;
  startDate: string | null;
  schedule: string | null;
  location: string | null;
  maxStudents: number;
  price: number;
  currency: string;
  notes: string | null;
  canAccessClassroom: boolean;
};

type CustomerCourseRow = Omit<CustomerCourseDetail, 'canAccessClassroom'>;

function withClassroomAccess(course: CustomerCourseRow): CustomerCourseDetail {
  return {
    ...course,
    canAccessClassroom: canAccessCourseClassroom(
      {
        registrationStatus: course.registrationStatus,
        paymentStatus: course.paymentStatus,
      },
      course.price
    ),
  };
}

export async function fetchCustomerCourses(
  userId: string
): Promise<CustomerCourseRegistration[]> {
  try {
    const rows = await sql<Omit<CustomerCourseRegistration, 'canAccessClassroom'>[]>`
      SELECT
        r.id as "registrationId",
        r.registration_status as "registrationStatus",
        r.payment_status as "paymentStatus",
        c.id as "courseId",
        c.title,
        c.slug,
        c.short_description as "shortDescription",
        c.duration,
        c.level,
        c.modality,
        c.start_date as "startDate",
        COALESCE(c.price, 0)::float as price,
        c.currency
      FROM course_registrations r
      JOIN courses c ON c.id = r.course_id
      WHERE r.user_id = ${userId}
        AND c.deleted_at IS NULL
        AND r.registration_status != 'cancelled'
      ORDER BY r.created_at DESC
    `;

    return rows.map((row) => ({
      ...row,
      canAccessClassroom: canAccessCourseClassroom(
        {
          registrationStatus: row.registrationStatus,
          paymentStatus: row.paymentStatus,
        },
        row.price
      ),
    }));
  } catch (error) {
    console.error('Failed to fetch customer courses:', error);
    throw new Error('Failed to fetch customer courses.');
  }
}

export async function fetchCustomerCourseBySlug(
  userId: string,
  slug: string
): Promise<CustomerCourseDetail | undefined> {
  try {
    const rows = await sql<CustomerCourseRow[]>`
      SELECT
        r.id as "registrationId",
        r.registration_status as "registrationStatus",
        r.payment_status as "paymentStatus",
        c.id,
        c.title,
        c.slug,
        c.short_description as "shortDescription",
        c.duration,
        c.level,
        c.learning_objective as "learningObjective",
        c.learning_outcomes as "learningOutcomes",
        c.modality,
        c.start_date as "startDate",
        c.schedule,
        c.location,
        c.max_students as "maxStudents",
        COALESCE(c.price, 0)::float as price,
        c.currency,
        c.notes
      FROM course_registrations r
      JOIN courses c ON c.id = r.course_id
      WHERE r.user_id = ${userId}
        AND c.slug = ${slug}
        AND c.deleted_at IS NULL
        AND r.registration_status != 'cancelled'
      ORDER BY r.created_at DESC
      LIMIT 1
    `;

    if (!rows[0]) {
      return undefined;
    }

    return withClassroomAccess(rows[0]);
  } catch (error) {
    console.error('Failed to fetch customer course:', error);
    throw new Error('Failed to fetch customer course.');
  }
}
