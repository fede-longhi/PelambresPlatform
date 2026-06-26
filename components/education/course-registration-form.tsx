'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { registerForCourse, RegistrationFormState } from '@/lib/actions/course-actions';

type CourseRegistrationFormProps = {
    courseId: string;
};

export function CourseRegistrationForm({ courseId }: CourseRegistrationFormProps) {
    
    // 1. Atamos el ID del curso como primer argumento de la Server Action
    const registerWithId = registerForCourse.bind(null, courseId);
    
    const initialState: RegistrationFormState = { message: null, errors: {}, success: false };
    
    // 2. Usamos el hook nativo de React para manejar el estado del formulario
    const [state, formAction, isPending] = useActionState(registerWithId, initialState);

    // Pantalla de éxito (Si la action devuelve success: true)
    if (state.success) {
        return (
            <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <h4 className="text-xl font-bold text-slate-900">¡Inscripción recibida!</h4>
                <p className="text-slate-500 text-sm">
                    {state.message || "Te hemos enviado un correo con el enlace de confirmación."}
                </p>
            </div>
        );
    }

    return (
        <form action={formAction} className="space-y-4">

            {/* Error general del servidor */}
            {state.success === false && state.message && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-100">
                    {state.message}
                </div>
            )}

            {/* ATENCIÓN: name="name" para que coincida con Zod */}
            <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input 
                    id="name" 
                    name="name" 
                    required 
                    placeholder="Ej: Juan Pérez" 
                    disabled={isPending} 
                />
                {state.errors?.name && (
                    <p className="text-xs text-red-500 mt-1">{state.errors.name[0]}</p>
                )}
            </div>
            
            {/* ATENCIÓN: name="email" para que coincida con Zod */}
            <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    required 
                    placeholder="tu@email.com" 
                    disabled={isPending} 
                />
                {state.errors?.email && (
                    <p className="text-xs text-red-500 mt-1">{state.errors.email[0]}</p>
                )}
            </div>

            {/* ATENCIÓN: name="phone" para que coincida con Zod */}
            <div className="space-y-2">
                <Label htmlFor="phone">WhatsApp (opcional)</Label>
                <Input 
                    id="phone" 
                    name="phone" 
                    type="tel" 
                    placeholder="+54 9 11 1234 5678" 
                    disabled={isPending} 
                />
                {state.errors?.phone && (
                    <p className="text-xs text-red-500 mt-1">{state.errors.phone[0]}</p>
                )}
            </div>

            <Button type="submit" className="w-full mt-6" disabled={isPending}>
                {isPending ? 'Procesando inscripción...' : 'Quiero inscribirme'}
            </Button>
            
            <p className="text-xs text-center text-slate-400 mt-4">
                Tus datos están seguros y serán utilizados únicamente para este curso.
            </p>
        </form>
    );
}