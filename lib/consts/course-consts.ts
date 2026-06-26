export const COURSE_LEVELS = [
    { value: 'beginner', label: 'Principiante' },
    { value: 'intermediate', label: 'Intermedio' },
    { value: 'advanced', label: 'Avanzado' }
] as const;

export const COURSE_MODALITIES = [
    { value: 'in-person', label: 'Presencial' },
    { value: 'synchronous', label: 'Virtual Sincrónica (En Vivo)' },
    { value: 'asynchronous', label: 'Virtual Asincrónica' }
] as const;

export const CURRENCIES = [
    { value: 'ARS', label: 'ARS' },
    { value: 'USD', label: 'USD' }
] as const;