import sql from '@/lib/db';

export type AdminCourseListItem = {
    id: string;
    title: string;
    slug: string;
    duration: string;
    isPublished: boolean;
    registrations: number;
};

export type AdminCourseDetail = {
    id: string;
    title: string;
    slug: string;
    shortDescription: string;
    duration: string;
    level: string;
    isPublished: boolean;
    createdAt: Date;
    learningObjective: string | null;
    learningOutcomes: string | null;
    registrations: number;
};

export type CourseRow = {
    id: string;
    title: string;
    slug: string;
    shortDescription: string;
    duration: string;
    level: string;
    isPublished: boolean;
    learningObjective?: string;
    learningOutcomes?: string;
    modality?: string;
    startDate?: string | null;
    schedule?: string;
    location?: string;
    maxStudents?: number;
    price?: number;
    currency?: string;
    notes?: string;
};

export type CourseRegistrationRow = {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    created_at: Date;
    registration_status: string;
    payment_status: string;
    payment_method: string | null;
    attended: boolean;
};

export type BroadcastRegistrant = {
    id: string;
    name: string;
    email: string;
};

export type PublishedCourseCatalogItem = {
    id: string;
    title: string;
    slug: string;
    shortDescription: string;
    duration: string;
    level: string;
};

export type PublishedCourse = {
    id: string;
    title: string;
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
    price: number | null;
    currency: string;
    notes: string | null;
};

export type CourseSlugAndTitle = {
    title: string;
    slug: string;
};

export type RegistrationConfirmationRow = {
    id: string;
    token_used: boolean;
    courseTitle: string;
};

export async function fetchAdminCourses(): Promise<AdminCourseListItem[]> {
    try {
        return await sql<AdminCourseListItem[]>`
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
        `;
    } catch (error) {
        console.error('Database error fetching admin courses:', error);
        throw new Error('Failed to fetch courses.');
    }
}

export async function fetchAdminCourseById(courseId: string): Promise<AdminCourseDetail | null> {
    try {
        const courses = await sql<AdminCourseDetail[]>`
            SELECT 
                c.id, 
                c.title, 
                c.slug, 
                c.short_description as "shortDescription", 
                c.duration, 
                c.level, 
                c.is_published as "isPublished",
                c.created_at as "createdAt",
                c.learning_objective as "learningObjective",
                c.learning_outcomes as "learningOutcomes",
                COUNT(r.id)::int as registrations
            FROM courses c
            LEFT JOIN course_registrations r ON c.id = r.course_id
            WHERE c.id = ${courseId} AND c.deleted_at IS NULL
            GROUP BY c.id
            LIMIT 1
        `;
        return courses[0] ?? null;
    } catch (error) {
        console.error('Database error fetching course:', error);
        throw new Error('Failed to fetch course.');
    }
}

export async function fetchCourseForEdit(courseId: string): Promise<CourseRow | null> {
    try {
        const courses = await sql<CourseRow[]>`
            SELECT 
                id, 
                title, 
                slug, 
                short_description as "shortDescription", 
                duration, 
                level, 
                is_published as "isPublished",
                learning_objective as "learningObjective",
                learning_outcomes as "learningOutcomes",
                modality,
                start_date as "startDate",
                schedule,
                location,
                max_students as "maxStudents",
                price,
                currency,
                notes
            FROM courses 
            WHERE id = ${courseId}
            LIMIT 1
        `;
        return courses[0] ?? null;
    } catch (error) {
        console.error('Database error fetching course for edit:', error);
        throw new Error('Failed to fetch course.');
    }
}

export async function fetchCourseTitle(courseId: string): Promise<string | null> {
    try {
        const courses = await sql<{ title: string }[]>`
            SELECT title FROM courses WHERE id = ${courseId}
        `;
        return courses[0]?.title ?? null;
    } catch (error) {
        console.error('Database error fetching course title:', error);
        throw new Error('Failed to fetch course.');
    }
}

export async function fetchCourseSlugAndTitle(courseId: string): Promise<CourseSlugAndTitle | null> {
    try {
        const courses = await sql<CourseSlugAndTitle[]>`
            SELECT title, slug FROM courses WHERE id = ${courseId}
        `;
        return courses[0] ?? null;
    } catch (error) {
        console.error('Database error fetching course:', error);
        throw new Error('Failed to fetch course.');
    }
}

export async function fetchCourseRegistrations(courseId: string): Promise<CourseRegistrationRow[]> {
    try {
        return await sql<CourseRegistrationRow[]>`
            SELECT 
                id, full_name as name, email_address as email, phone_number as phone, created_at, 
                registration_status, payment_status, payment_method, attended
            FROM course_registrations 
            WHERE course_id = ${courseId}
            ORDER BY created_at DESC
        `;
    } catch (error) {
        console.error('Database error fetching registrations:', error);
        throw new Error('Failed to fetch registrations.');
    }
}

export async function fetchBroadcastRegistrants(courseId: string): Promise<BroadcastRegistrant[]> {
    try {
        return await sql<BroadcastRegistrant[]>`
            SELECT id, full_name as name, email_address as email 
            FROM course_registrations 
            WHERE course_id = ${courseId}
            ORDER BY full_name ASC
        `;
    } catch (error) {
        console.error('Database error fetching registrants:', error);
        throw new Error('Failed to fetch registrants.');
    }
}

export async function fetchPublishedCourses(): Promise<PublishedCourseCatalogItem[]> {
    try {
        return await sql<PublishedCourseCatalogItem[]>`
            SELECT 
                id, 
                title, 
                slug, 
                short_description as "shortDescription", 
                duration, 
                level 
            FROM courses 
            WHERE is_published = true AND deleted_at IS NULL
            ORDER BY created_at DESC
        `;
    } catch (error) {
        console.error('Database error fetching published courses:', error);
        throw new Error('Failed to fetch courses.');
    }
}

export async function fetchPublishedCourseBySlug(slug: string): Promise<PublishedCourse | null> {
    try {
        const courses = await sql<PublishedCourse[]>`
            SELECT 
                id, 
                title, 
                short_description as "shortDescription", 
                duration, 
                level,
                learning_objective as "learningObjective",
                learning_outcomes as "learningOutcomes",
                modality,
                start_date as "startDate",
                schedule,
                location,
                max_students as "maxStudents",
                price,
                currency,
                notes
            FROM courses 
            WHERE slug = ${slug} AND is_published = true AND deleted_at IS NULL
            LIMIT 1
        `;
        return courses[0] ?? null;
    } catch (error) {
        console.error('Database error fetching published course:', error);
        throw new Error('Failed to fetch course.');
    }
}

export async function fetchRegistrationByConfirmationToken(
    token: string
): Promise<RegistrationConfirmationRow | null> {
    try {
        const registrations = await sql<RegistrationConfirmationRow[]>`
            SELECT r.id, r.token_used, c.title as "courseTitle"
            FROM course_registrations r
            JOIN courses c ON r.course_id = c.id
            WHERE r.confirmation_token = ${token}
            LIMIT 1
        `;
        return registrations[0] ?? null;
    } catch (error) {
        console.error('Database error fetching registration by token:', error);
        throw new Error('Failed to fetch registration.');
    }
}

export async function markRegistrationConfirmed(registrationId: string): Promise<void> {
    try {
        await sql`
            UPDATE course_registrations
            SET registration_status = 'confirmed',
                token_used = true
            WHERE id = ${registrationId}
        `;
    } catch (error) {
        console.error('Database error confirming registration:', error);
        throw new Error('Failed to confirm registration.');
    }
}
