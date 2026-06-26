'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createCourse, CourseFormState } from '@/lib/actions/course-actions';
import { COURSE_LEVELS, COURSE_MODALITIES, CURRENCIES } from '@/lib/consts/course-consts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function NewCoursePage() {
    const initialState: CourseFormState = { message: null, errors: {} };
    const [state, formAction, isPending] = useActionState(createCourse, initialState);

    const [title, setTitle] = useState((state.payload?.get('title') as string) || '');
    const [slug, setSlug] = useState((state.payload?.get('slug') as string) || '');

    const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = event.target.value;
        setTitle(newTitle);
        
        const generatedSlug = newTitle
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
            
        setSlug(generatedSlug);
    };

    return (
        <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-8">
            
            <div className="flex items-center gap-4">
                <Link href="/admin/courses">
                    <Button variant="outline" size="icon" className="shrink-0" disabled={isPending}>
                        <ArrowLeft size={18} />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Crear Nuevo Curso</h1>
                    <p className="text-slate-500 mt-1">Completa los detalles para publicar una nueva capacitación.</p>
                </div>
            </div>

            <form action={formAction} className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 md:p-8 space-y-6" aria-busy={isPending}>
                
                {/* Mensaje de error general */}
                <div aria-live="polite" aria-atomic="true">
                    {state.success === false && state.message && (
                        <div className="flex flex-row items-center text-sm text-red-500 border border-red-200 bg-red-50 rounded-md p-3 mb-4">
                            <p>{state.message}</p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="title">Título del Curso</Label>
                        <Input 
                            id="title" 
                            name="title" 
                            value={title}
                            onChange={handleTitleChange}
                            disabled={isPending}
                            aria-describedby="title-error"
                        />
                        <div id="title-error" aria-live="polite" aria-atomic="true">
                            {state.errors?.title?.map((error) => (
                                <p className="mt-1 text-xs text-red-500" key={error}>{error}</p>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="slug">Slug (URL)</Label>
                        <Input 
                            id="slug" 
                            name="slug" 
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            className="bg-slate-50 font-mono text-sm text-slate-600"
                            disabled={isPending}
                            aria-describedby="slug-error"
                        />
                        <div id="slug-error" aria-live="polite" aria-atomic="true">
                            {state.errors?.slug?.map((error) => (
                                <p className="mt-1 text-xs text-red-500" key={error}>{error}</p>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="duration">Duración</Label>
                        <Input 
                            id="duration" 
                            name="duration" 
                            defaultValue={state.payload?.get('duration') as string || ''}
                            disabled={isPending} 
                            aria-describedby="duration-error"
                        />
                        <div id="duration-error" aria-live="polite" aria-atomic="true">
                            {state.errors?.duration?.map((error) => (
                                <p className="mt-1 text-xs text-red-500" key={error}>{error}</p>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="level">Nivel</Label>
                        <Select 
                            name="level" 
                            defaultValue={state.payload?.get('level') as string || undefined}
                            disabled={isPending}
                        >
                            <SelectTrigger id="level" aria-describedby="level-error">
                                <SelectValue placeholder="Selecciona un nivel..." />
                            </SelectTrigger>
                            <SelectContent>
                                {COURSE_LEVELS.map((level) => (
                                    <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div id="level-error" aria-live="polite" aria-atomic="true">
                            {state.errors?.level?.map((error) => (
                                <p className="mt-1 text-xs text-red-500" key={error}>{error}</p>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="shortDescription">Descripción Corta</Label>
                        <textarea 
                            id="shortDescription" 
                            name="shortDescription" 
                            rows={3}
                            defaultValue={state.payload?.get('shortDescription') as string || ''}
                            className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={isPending}
                            aria-describedby="shortDescription-error"
                        ></textarea>
                        <div id="shortDescription-error" aria-live="polite" aria-atomic="true">
                            {state.errors?.shortDescription?.map((error) => (
                                <p className="mt-1 text-xs text-red-500" key={error}>{error}</p>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2 md:col-span-2 pt-4 border-t border-slate-100">
                        <Label htmlFor="learningObjective">Párrafo Introductorio (Opcional)</Label>
                        <textarea 
                            id="learningObjective" 
                            name="learningObjective" 
                            rows={3}
                            defaultValue={state.payload?.get('learningObjective') as string || ''}
                            className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm disabled:opacity-50"
                            disabled={isPending}
                        ></textarea>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="learningOutcomes">Puntos Clave (Opcional)</Label>
                        <textarea 
                            id="learningOutcomes" 
                            name="learningOutcomes" 
                            rows={5}
                            defaultValue={state.payload?.get('learningOutcomes') as string || ''}
                            className="flex min-h-[120px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm disabled:opacity-50"
                            disabled={isPending}
                        ></textarea>
                    </div>

                    {/* --- NUEVA SECCIÓN: LOGÍSTICA Y COMERCIALIZACIÓN --- */}
                    <div className="md:col-span-2 pt-6 pb-2 border-t border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Logística y Comercialización</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Modalidad */}
                            <div className="space-y-2">
                                <Label htmlFor="modality">Modalidad *</Label>
                                    <Select 
                                    name="modality" 
                                    defaultValue={(state.payload?.get('modality') as string) ?? "asynchronous"}
                                    disabled={isPending}
                                >
                                    <SelectTrigger id="modality" aria-describedby="modality-error">
                                        <SelectValue placeholder="Selecciona..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {COURSE_MODALITIES.map((modality) => (
                                            <SelectItem key={modality.value} value={modality.value}>
                                                {modality.label} ({modality.value})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <div id="modality-error" aria-live="polite" aria-atomic="true">
                                    {state.errors?.modality?.map((error) => (
                                        <p className="mt-1 text-xs text-red-500" key={error}>{error}</p>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="startDate">Fecha de Inicio (Opcional)</Label>
                                <Input 
                                    id="startDate" 
                                    name="startDate" 
                                    type="date"
                                    defaultValue={state.payload?.get('startDate') as string || ''}
                                    disabled={isPending} 
                                />
                            </div>

                            {/* Días y Horarios */}
                            <div className="space-y-2">
                                <Label htmlFor="schedule">Días y Horarios (Opcional)</Label>
                                <Input 
                                    id="schedule" 
                                    name="schedule" 
                                    placeholder="Ej: Martes y Jueves de 18 a 20hs"
                                    defaultValue={state.payload?.get('schedule') as string || ''}
                                    disabled={isPending} 
                                />
                            </div>

                            {/* Ubicación / Plataforma */}
                            <div className="space-y-2">
                                <Label htmlFor="location">Ubicación / Plataforma (Opcional)</Label>
                                <Input 
                                    id="location" 
                                    name="location" 
                                    placeholder="Ej: Vía Zoom o Sede Martínez"
                                    defaultValue={state.payload?.get('location') as string || ''}
                                    disabled={isPending} 
                                />
                            </div>

                            {/* Cupos */}
                            <div className="space-y-2">
                                <Label htmlFor="maxStudents">Cupos (0 = Ilimitados)</Label>
                                <Input 
                                    id="maxStudents" 
                                    name="maxStudents" 
                                    type="number"
                                    min="0"
                                    defaultValue={state.payload?.get('maxStudents') as string || 0}
                                    disabled={isPending} 
                                />
                            </div>

                            {/* Precio y Moneda */}
                            <div className="space-y-2">
                                <Label htmlFor="price">Precio *</Label>
                                <div className="flex gap-2">
                                    <div className="w-1/3">
                                        <Select 
                                        name="currency" 
                                        defaultValue={(state.payload?.get('currency') as string) ?? "ARS"}
                                        disabled={isPending}
                                    >
                                        <SelectTrigger id="currency">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CURRENCIES.map((curr) => (
                                                <SelectItem key={curr.value} value={curr.value}>
                                                    {curr.label} $
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    </div>
                                    <div className="w-2/3">
                                        <Input 
                                            id="price" 
                                            name="price" 
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            defaultValue={state.payload?.get('price') as string || 0}
                                            disabled={isPending} 
                                            aria-describedby="price-error"
                                        />
                                    </div>
                                </div>
                                <div id="price-error" aria-live="polite" aria-atomic="true">
                                    {state.errors?.price?.map((error) => (
                                        <p className="mt-1 text-xs text-red-500" key={error}>{error}</p>
                                    ))}
                                </div>
                            </div>

                            {/* Notas */}
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="notes">Notas o Aclaraciones (Opcional)</Label>
                                <textarea 
                                    id="notes" 
                                    name="notes" 
                                    rows={2}
                                    placeholder="Ej: Requiere conocimientos básicos de laminado."
                                    defaultValue={state.payload?.get('notes') as string || ''}
                                    className="flex min-h-[60px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm disabled:opacity-50"
                                    disabled={isPending}
                                ></textarea>
                            </div>
                            
                        </div>
                    </div>
                    {/* --- FIN SECCIÓN: LOGÍSTICA --- */}

                    <div className="space-y-2 md:col-span-2 pt-2 border-t border-slate-100 flex items-center gap-3">
                        <input 
                            type="checkbox" 
                            id="isPublished" 
                            name="isPublished"
                            defaultChecked={state.payload ? state.payload.get('isPublished') === 'on' : false}
                            className="h-5 w-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                            disabled={isPending}
                        />
                        <Label htmlFor="isPublished" className="cursor-pointer">Publicar curso inmediatamente</Label>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                    <Link href="/admin/courses">
                        <Button type="button" variant="outline" disabled={isPending}>
                            Cancelar
                        </Button>
                    </Link>
                    <Button type="submit" disabled={isPending} className="bg-slate-900 text-white">
                        {isPending ? 'Guardando...' : <><Save size={18} className="mr-2" /> Guardar Curso</>}
                    </Button>
                </div>
            </form>
            
        </div>
    );
}