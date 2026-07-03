'use server';

import { z } from 'zod';
import sql from '@/lib/db';
import {
    fetchExistingCourseRegistration,
    fetchCourseSlugAndTitle,
    linkCourseRegistrationsToUser,
} from '@/lib/data/course-data';
import { fetchLinkedCustomerForUser } from '@/lib/data/customer-portal-data';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { sendCourseConfirmationEmail } from '@/lib/mail/mailer';
import { COURSE_LEVELS, COURSE_MODALITIES, CURRENCIES } from '@/lib/consts/course-consts';
import { auth } from '@/auth';

const levelValues = COURSE_LEVELS.map(l => l.value) as [string, ...string[]];
const modalityValues = COURSE_MODALITIES.map(m => m.value) as [string, ...string[]];
const currencyValues = CURRENCIES.map(c => c.value) as [string, ...string[]];

const CourseSchema = z.object({
    title: z.string().min(3, { message: "El título debe tener al menos 3 caracteres." }),
    slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
    shortDescription: z.string().min(10),
    duration: z.string().min(1),
    level: z.enum(levelValues, { message: "Selecciona un nivel válido." }),
    isPublished: z.boolean(),
    learningObjective: z.string().optional(),
    learningOutcomes: z.string().optional(),
    modality: z.enum(modalityValues, { message: "Selecciona una modalidad válida." }),
    startDate: z.string().optional(),
    schedule: z.string().optional(),
    location: z.string().optional(),
    maxStudents: z.coerce.number().min(0).optional(),
    price: z.coerce.number().min(0, { message: "El precio no puede ser negativo." }).optional(),
    currency: z.enum(currencyValues, { message: "Selecciona una moneda válida." }),
    notes: z.string().optional(),
});

export type CourseFormState = {
    errors?: {
        title?: string[];
        slug?: string[];
        shortDescription?: string[];
        duration?: string[];
        level?: string[];
        modality?: string[];
        price?: string[];
        currency?: string[];
    };
    message?: string | null;
    success?: boolean;
    payload?: FormData;
};

const CourseRegistrationSchema = z.object({
    courseId: z.string().min(1, { message: 'El curso es obligatorio.' }),
    fullName: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }),
    emailAddress: z.string().email({ message: 'Ingresá un correo electrónico válido.' }),
    phoneNumber: z.string().optional(),
});

type CourseRegistrationActionResult = {
    success: boolean;
    message: string;
};

const RegistrationSchema = z.object({
    name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
    email: z.string().email({ message: "Ingresa un correo electrónico válido." }),
    phone: z.string().optional(),
});

export type RegistrationFormState = {
    errors?: { name?: string[]; email?: string[]; phone?: string[] };
    message?: string | null;
    success?: boolean;
};

export async function createCourse(
    prevState: CourseFormState, 
    formData: FormData
) {

    const validatedFields = CourseSchema.safeParse({
        title: formData.get('title'),
        slug: formData.get('slug'),
        shortDescription: formData.get('shortDescription'),
        duration: formData.get('duration'),
        level: formData.get('level'),
        isPublished: formData.get('isPublished') === 'on',
        learningObjective: formData.get('learningObjective'),
        learningOutcomes: formData.get('learningOutcomes'),
        modality: formData.get('modality'),
        startDate: formData.get('startDate'),
        schedule: formData.get('schedule'),
        location: formData.get('location'),
        maxStudents: formData.get('maxStudents'),
        price: formData.get('price'),
        currency: formData.get('currency'),
        notes: formData.get('notes'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Faltan completar algunos campos o hay errores de validación.",
            payload: formData,
            success: false
        };
    }

    const { 
        title, slug, shortDescription, duration, level, isPublished, 
        learningObjective, learningOutcomes,
        modality, startDate, schedule, location, maxStudents, price, currency, notes
    } = validatedFields.data;

    try {
        await sql`
            INSERT INTO courses (
                title, slug, short_description, duration, level, is_published,
                learning_objective, learning_outcomes,
                modality, start_date, schedule, location, max_students, price, currency, notes
            ) VALUES (
                ${title}, ${slug}, ${shortDescription}, ${duration}, ${level}, ${isPublished},
                ${learningObjective ?? null}, ${learningOutcomes ?? null},
                ${modality}, 
                ${startDate ? startDate : null}, 
                ${schedule ?? null}, 
                ${location ?? null}, 
                ${maxStudents ?? 0}, 
                ${price ?? null}, 
                ${currency}, 
                ${notes ?? null}
            )
        `;
    } catch (error: any) {
        console.error('Database error inserting course:', error);
        
        // Atrapamos si el slug ya existe en la base de datos
        if (error.code === '23505') {
            return { 
                success: false, 
                message: 'Ya existe un curso con este Slug. Por favor, elige otro.',
                payload: formData 
            };
        }

        return { 
            success: false, 
            message: 'Hubo un error interno al guardar el curso.',
            payload: formData 
        };
    }

    revalidatePath('/admin/courses');
    redirect('/admin/courses');
}

export async function updateCourse(
    id: string,
    prevState: CourseFormState, 
    formData: FormData
) {
    const validatedFields = CourseSchema.safeParse({
        title: formData.get('title'),
        slug: formData.get('slug'),
        shortDescription: formData.get('shortDescription'),
        duration: formData.get('duration'),
        level: formData.get('level'),
        isPublished: formData.get('isPublished') === 'on',
        learningObjective: formData.get('learningObjective'),
        learningOutcomes: formData.get('learningOutcomes'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Faltan completar algunos campos o hay errores de validación.",
            payload: formData,
            success: false
        };
    }

    const { 
        title, slug, shortDescription, duration, level, 
        isPublished, learningObjective, learningOutcomes 
    } = validatedFields.data;

    try {
        await sql`
            UPDATE courses 
            SET 
                title = ${title}, 
                slug = ${slug}, 
                short_description = ${shortDescription}, 
                duration = ${duration}, 
                level = ${level}, 
                is_published = ${isPublished},
                learning_objective = ${learningObjective ?? null},
                learning_outcomes = ${learningOutcomes ?? null},
                updated_at = NOW()
            WHERE id = ${id}
        `;
    } catch (error: any) {
        console.error('Database error updating course:', error);
        
        if (error.code === '23505') {
            return { 
                success: false, 
                message: 'Ya existe otro curso con este Slug. Por favor, elige otro.',
                payload: formData 
            };
        }

        return { 
            success: false, 
            message: 'Hubo un error interno al actualizar el curso.',
            payload: formData 
        };
    }

    revalidatePath('/admin/courses');
    redirect('/admin/courses');
}

export async function deleteCourse(id: string) {
    try {
        await sql`
            UPDATE courses 
            SET deleted_at = NOW() 
            WHERE id = ${id}
        `;
        revalidatePath('/admin/courses');
        revalidatePath('/education');
    } catch (error) {
        console.error('Database error deleting course:', error);
        throw new Error('Failed to delete course.');
    }
}

export async function registerForCourse(
    courseId: string,
    prevState: RegistrationFormState,
    formData: FormData
) {
    const session = await auth();
    const sessionUser = session?.user;

    let name: string;
    let email: string;
    let phone: string | undefined;
    let userId: string | null = null;

    if (sessionUser?.email && sessionUser.isActive !== false) {
        name = (sessionUser.name ?? '').trim();
        email = sessionUser.email.trim();
        userId = sessionUser.id;

        if (name.length < 3) {
            return {
                success: false,
                message: 'Completá tu nombre en el perfil antes de inscribirte.',
            };
        }

        const linkedCustomer = await fetchLinkedCustomerForUser(sessionUser.id, email);
        phone = linkedCustomer?.phone?.trim() || undefined;
    } else {
        const validatedFields = RegistrationSchema.safeParse({
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
        });

        if (!validatedFields.success) {
            return {
                errors: validatedFields.error.flatten().fieldErrors,
                message: 'Por favor, revisa los datos ingresados.',
                success: false,
            };
        }

        ({ name, email, phone } = validatedFields.data);
    }

    const existingRegistration = await fetchExistingCourseRegistration(courseId, {
        email,
        userId,
    });

    if (existingRegistration) {
        const statusMessage =
            existingRegistration.registrationStatus === 'confirmed'
                ? 'Ya estás inscripto a este curso.'
                : 'Ya tenés una inscripción pendiente. Revisá tu correo para confirmarla.';

        return {
            success: false,
            message: statusMessage,
        };
    }

    try {
        const course = await fetchCourseSlugAndTitle(courseId);
        if (!course) {
            return { success: false, message: 'El curso seleccionado no existe.' };
        }
        const { title: courseTitle, slug: courseSlug } = course;

        const result = await sql`
            INSERT INTO course_registrations 
                (course_id, user_id, full_name, email_address, phone_number, registration_status, payment_status)
            VALUES 
                (${courseId}, ${userId}, ${name}, ${email}, ${phone ?? null}, 'pending', 'pending')
            RETURNING confirmation_token as "token"
        `;
        
        const token = result[0].token;

        if (userId) {
            await linkCourseRegistrationsToUser(userId, email);
        }

        await sendCourseConfirmationEmail(email, name, courseTitle, courseSlug, token);

        revalidatePath('/customer/courses');
        revalidatePath(`/education/${courseSlug}`);

        return {
            success: true,
            message: '¡Registro recibido! Te enviamos un enlace de confirmación a tu correo electrónico. Por favor, revisá tu bandeja de entrada.',
        };

    } catch (error) {
        console.error('Error en la inscripción pública:', error);
        return {
            success: false,
            message: 'Hubo un problema al procesar tu inscripción. Inténtalo de nuevo más tarde.',
        };
    }
}

