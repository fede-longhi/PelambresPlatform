'use client';

import { useActionState, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, Bold, Italic, List, ListOrdered, Heading2, RotateCcw, CheckSquare, Square, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { lusitana } from '@/app/fonts';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sendBroadcastEmail, BroadcastFormState } from '@/lib/actions/email-actions';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

type Registrant = {
    id: string;
    name: string;
    email: string;
};

type BroadcastFormProps = {
    courseId: string;
    courseTitle: string;
    initialRegistrants: Registrant[];
};

export function BroadcastEmailForm({ courseId, courseTitle, initialRegistrants }: BroadcastFormProps) {
    const sendBroadcastWithId = sendBroadcastEmail.bind(null, courseId);
    const initialState: BroadcastFormState = { message: null, errors: {} };
    const [state, formAction, isPending] = useActionState(sendBroadcastWithId, initialState);

    const [htmlContent, setHtmlContent] = useState('');
    
    // Estado para manejar los emails seleccionados
    const [selectedEmails, setSelectedEmails] = useState<string[]>(
        initialRegistrants.map(r => r.email) // Por defecto, todos seleccionados
    );

    const editor = useEditor({
        extensions: [StarterKit],
        content: '<p>Escribe el cuerpo del correo aquí...</p>',
        editorProps: {
            attributes: {
                class: 'min-h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring prose prose-sm focus:outline-none max-w-none',
            },
        },
        onUpdate: ({ editor }) => {
            setHtmlContent(editor.getHTML());
        },
    });

    useEffect(() => {
        if (state.success && editor) {
            editor.commands.setContent('<p></p>');
            setHtmlContent('');
        }
    }, [state.success, editor]);

    // Alternar selección de un alumno individual
    const toggleSelectEmail = (email: string) => {
        setSelectedEmails(prev => 
            prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
        );
    };

    // Alternar seleccionar todos o ninguno
    const toggleSelectAll = () => {
        if (selectedEmails.length === initialRegistrants.length) {
            setSelectedEmails([]); // Deseleccionar todos
        } else {
            setSelectedEmails(initialRegistrants.map(r => r.email)); // Seleccionar todos
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild className="size-11 shrink-0 md:size-9">
                    <Link href={`/admin/courses/${courseId}/registrations`} aria-label="Volver a inscripciones">
                        <ArrowLeft size={18} aria-hidden="true" />
                    </Link>
                </Button>
                <div>
                    <h1 className={`${lusitana.className} text-2xl font-semibold`}>Correo masivo</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Curso: <span className="font-medium text-foreground">{courseTitle}</span>
                    </p>
                </div>
            </div>

            <form action={formAction} className="grid grid-cols-1 lg:grid-cols-3 gap-8" aria-busy={isPending}>
                
                {/* COLUMNA IZQUIERDA Y CENTRAL: Redacción del Email (ocupa 2 columnas en pantallas grandes) */}
                <div className="self-start space-y-6 rounded-lg border bg-card p-6 lg:col-span-2">
                    
                    <div aria-live="polite" aria-atomic="true">
                        {state.message && (
                            <div className={`p-4 rounded-md text-sm border ${
                                state.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
                            }`}>
                                <p>{state.message}</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="subject">Asunto del Email</Label>
                            <Input 
                                id="subject" name="subject" 
                                placeholder="Ej: ¡Información importante sobre el inicio del curso!"
                                defaultValue={state.success ? '' : undefined}
                                disabled={isPending}
                                aria-describedby="subject-error"
                            />
                            <div id="subject-error" aria-live="polite" aria-atomic="true">
                                {state.errors?.subject?.map((error) => (
                                    <p className="mt-1 text-xs text-red-500" key={error}>{error}</p>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Cuerpo del Mensaje</Label>
                            <input type="hidden" name="message" value={htmlContent} />

                            {editor && (
                                <div className="flex flex-wrap gap-1 rounded-t-md border border-b-0 bg-muted/40 p-1">
                                    <Button
                                        type="button" variant="ghost" size="icon" className={`h-8 w-8 ${editor.isActive('bold') ? 'bg-muted' : ''}`}
                                        aria-label="Negrita"
                                        onClick={() => editor.chain().focus().toggleBold().run()} disabled={isPending}
                                    >
                                        <Bold size={16} aria-hidden="true" />
                                    </Button>
                                    <Button
                                        type="button" variant="ghost" size="icon" className={`h-8 w-8 ${editor.isActive('italic') ? 'bg-muted' : ''}`}
                                        aria-label="Cursiva"
                                        onClick={() => editor.chain().focus().toggleItalic().run()} disabled={isPending}
                                    >
                                        <Italic size={16} aria-hidden="true" />
                                    </Button>
                                    <Button
                                        type="button" variant="ghost" size="icon" className={`h-8 w-8 ${editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}`}
                                        aria-label="Título"
                                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} disabled={isPending}
                                    >
                                        <Heading2 size={16} aria-hidden="true" />
                                    </Button>
                                    <div className="w-[1px] h-6 bg-border self-center mx-1" />
                                    <Button
                                        type="button" variant="ghost" size="icon" className={`h-8 w-8 ${editor.isActive('bulletList') ? 'bg-muted' : ''}`}
                                        aria-label="Lista con viñetas"
                                        onClick={() => editor.chain().focus().toggleBulletList().run()} disabled={isPending}
                                    >
                                        <List size={16} aria-hidden="true" />
                                    </Button>
                                    <Button
                                        type="button" variant="ghost" size="icon" className={`h-8 w-8 ${editor.isActive('orderedList') ? 'bg-muted' : ''}`}
                                        aria-label="Lista numerada"
                                        onClick={() => editor.chain().focus().toggleOrderedList().run()} disabled={isPending}
                                    >
                                        <ListOrdered size={16} aria-hidden="true" />
                                    </Button>
                                    <Button
                                        type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"
                                        aria-label="Limpiar contenido"
                                        onClick={() => editor.chain().focus().clearContent().run()} disabled={isPending}
                                    >
                                        <RotateCcw size={14} aria-hidden="true" />
                                    </Button>
                                </div>
                            )}

                            <div className={editor ? '[&_.ProseMirror]:rounded-t-none' : ''}>
                                <EditorContent editor={editor} />
                            </div>

                            <div id="message-error" aria-live="polite" aria-atomic="true">
                                {state.errors?.message?.map((error) => (
                                    <p className="mt-1 text-xs text-red-500" key={error}>{error}</p>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* COLUMNA DERECHA: Lista de Inscriptos Seleccionables */}
                <div className="self-start space-y-4 rounded-lg border bg-card p-6">
                    <div className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-2 font-semibold">
                            <Users size={18} className="text-muted-foreground" aria-hidden="true" />
                            <h2>Destinatarios</h2>
                        </div>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums">
                            {selectedEmails.length} / {initialRegistrants.length}
                        </span>
                    </div>

                    {initialRegistrants.length > 0 ? (
                        <div className="space-y-4">
                            {/* Botón rápido Seleccionar/Deseleccionar todos */}
                            <Button
                                type="button" variant="outline" size="sm" className="w-full text-xs justify-start gap-2"
                                onClick={toggleSelectAll} disabled={isPending}
                            >
                                {selectedEmails.length === initialRegistrants.length ? (
                                    <><Square size={14} aria-hidden="true" /> Deseleccionar todos</>
                                ) : (
                                    <><CheckSquare size={14} aria-hidden="true" /> Seleccionar todos</>
                                )}
                            </Button>

                            {/* Contenedor escroleable con los alumnos */}
                            <div className="max-h-[350px] space-y-2 overflow-y-auto rounded-lg border bg-muted/30 p-2 pr-1">
                                {initialRegistrants.map((registrant) => {
                                    const isChecked = selectedEmails.includes(registrant.email);
                                    return (
                                        <label 
                                            key={registrant.id} 
                                            className={`flex cursor-pointer items-start gap-3 rounded-md border p-2 text-sm transition-colors ${
                                                isChecked 
                                                    ? 'border-primary/30 bg-card shadow-sm' 
                                                    : 'border-transparent bg-card/60 opacity-70 hover:opacity-100'
                                            }`}
                                        >
                                            <input 
                                                type="checkbox" 
                                                name="selectedRegistrants" 
                                                value={registrant.email}
                                                checked={isChecked}
                                                onChange={() => toggleSelectEmail(registrant.email)}
                                                disabled={isPending}
                                                className="mt-1 size-4 rounded border-input text-primary focus:ring-ring"
                                            />
                                            <div className="space-y-0.5">
                                                <p className="leading-tight font-medium">{registrant.name}</p>
                                                <p className="break-all text-xs text-muted-foreground">{registrant.email}</p>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <p className="py-6 text-center text-sm text-muted-foreground">No hay alumnos inscriptos en este curso todavía.</p>
                    )}

                    <div className="flex flex-col gap-2 border-t pt-4">
                        <Button 
                            type="submit" 
                            disabled={isPending || selectedEmails.length === 0} 
                            className="w-full"
                        >
                            {isPending ? 'Enviando...' : <><Send size={16} className="mr-2" aria-hidden="true" /> Enviar correo</>}
                        </Button>
                        <Button type="button" variant="outline" className="w-full" asChild>
                            <Link href={`/admin/courses/${courseId}/registrations`}>Cancelar</Link>
                        </Button>
                    </div>
                </div>

            </form>
        </div>
    );
}