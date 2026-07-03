import { COURSE_LEVELS, COURSE_MODALITIES, CURRENCIES } from '@/lib/consts/course-consts';

export type CourseDisplayFields = {
    duration: string;
    level: string;
    modality: string;
    startDate?: string | null;
    schedule?: string | null;
    location?: string | null;
    maxStudents: number;
    price?: number | null;
    currency: string;
    learningObjective?: string | null;
    learningOutcomes?: string | null;
    notes?: string | null;
};

export function getCourseLevelLabel(level: string): string {
    return COURSE_LEVELS.find((item) => item.value === level)?.label ?? level;
}

export function getCourseModalityLabel(modality: string): string {
    return COURSE_MODALITIES.find((item) => item.value === modality)?.label ?? modality;
}

export function getCourseCurrencyLabel(currency: string): string {
    return CURRENCIES.find((item) => item.value === currency)?.label ?? currency;
}

export function formatCourseStartDate(startDate: string | null | undefined): string | null {
    if (!startDate) {
        return null;
    }

    return new Date(startDate).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
}

export function formatCoursePrice(price: number | null | undefined, currency: string): string {
    const numericPrice = Number(price);

    if (numericPrice > 0) {
        const currencyLabel = getCourseCurrencyLabel(currency);
        return `${currencyLabel} ${numericPrice.toLocaleString('es-AR', { minimumFractionDigits: 0 })}`;
    }

    return 'Gratis';
}

export function parseLearningOutcomes(learningOutcomes: string | null | undefined): string[] {
    if (!learningOutcomes) {
        return [];
    }

    return learningOutcomes
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line !== '');
}

export function formatCourseCapacity(
    maxStudents: number,
    activeRegistrations?: number
): { label: string; detail?: string } {
    if (maxStudents <= 0) {
        return { label: 'Cupos ilimitados' };
    }

    if (activeRegistrations === undefined) {
        return { label: `${maxStudents} lugares` };
    }

    const remaining = Math.max(maxStudents - activeRegistrations, 0);

    if (remaining === 0) {
        return {
            label: 'Sin cupos disponibles',
            detail: `${maxStudents} lugares en total`,
        };
    }

    return {
        label: `${remaining} de ${maxStudents} lugares disponibles`,
        detail:
            activeRegistrations > 0
                ? `${activeRegistrations} inscripto${activeRegistrations === 1 ? '' : 's'}`
                : undefined,
    };
}
