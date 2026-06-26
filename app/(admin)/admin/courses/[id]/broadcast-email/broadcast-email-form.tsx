'use client';

import { useActionState, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, Bold, Italic, List, ListOrdered, Heading2, RotateCcw, CheckSquare, Square, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
                class: 'min-h-[300px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 prose prose-sm focus:outline-none max-w-none',
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
                <Link href={`/admin/courses`}>
                    <Button variant="outline" size="icon" className="shrink-0" disabled={isPending}>
                        <ArrowLeft size={18} />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Broadcast Email</h1>
                    <p className="text-slate-500 mt-1">Curso: <span className="font-semibold text-slate-700">{courseTitle}</span></p>
                </div>
            </div>

            <form action={formAction} className="grid grid-cols-1 lg:grid-cols-3 gap-8" aria-busy={isPending}>
                
                {/* COLUMNA IZQUIERDA Y CENTRAL: Redacción del Email (ocupa 2 columnas en pantallas grandes) */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-6 self-start">
                    
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
                                <div className="flex flex-wrap gap-1 p-1 bg-slate-50 border border-slate-200 rounded-t-md border-b-0">
                                    <Button
                                        type="button" variant="ghost" size="icon" className={`h-8 w-8 ${editor.isActive('bold') ? 'bg-slate-200' : ''}`}
                                        onClick={() => editor.chain().focus().toggleBold().run()} disabled={isPending}
                                    >
                                        <Bold size={16} />
                                    </Button>
                                    <Button
                                        type="button" variant="ghost" size="icon" className={`h-8 w-8 ${editor.isActive('italic') ? 'bg-slate-200' : ''}`}
                                        onClick={() => editor.chain().focus().toggleItalic().run()} disabled={isPending}
                                    >
                                        <Italic size={16} />
                                    </Button>
                                    <Button
                                        type="button" variant="ghost" size="icon" className={`h-8 w-8 ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-200' : ''}`}
                                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} disabled={isPending}
                                    >
                                        <Heading2 size={16} />
                                    </Button>
                                    <div className="w-[1px] h-6 bg-slate-200 self-center mx-1" />
                                    <Button
                                        type="button" variant="ghost" size="icon" className={`h-8 w-8 ${editor.isActive('bulletList') ? 'bg-slate-200' : ''}`}
                                        onClick={() => editor.chain().focus().toggleBulletList().run()} disabled={isPending}
                                    >
                                        <List size={16} />
                                    </Button>
                                    <Button
                                        type="button" variant="ghost" size="icon" className={`h-8 w-8 ${editor.isActive('orderedList') ? 'bg-slate-200' : ''}`}
                                        onClick={() => editor.chain().focus().toggleOrderedList().run()} disabled={isPending}
                                    >
                                        <ListOrdered size={16} />
                                    </Button>
                                    <Button
                                        type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600"
                                        onClick={() => editor.chain().focus().clearContent().run()} disabled={isPending}
                                    >
                                        <RotateCcw size={14} />
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
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-4 self-start">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2 text-slate-900 font-bold">
                            <Users size={18} className="text-slate-500" />
                            <h2>Destinatarios</h2>
                        </div>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
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
                                    <><Square size={14} /> Deseleccionar todos</>
                                ) : (
                                    <><CheckSquare size={14} /> Seleccionar todos</>
                                )}
                            </Button>

                            {/* Contenedor escroleable con los alumnos */}
                            <div className="max-h-[350px] overflow-y-auto pr-1 space-y-2 border border-slate-100 rounded-lg p-2 bg-slate-50">
                                {initialRegistrants.map((registrant) => {
                                    const isChecked = selectedEmails.includes(registrant.email);
                                    return (
                                        <label 
                                            key={registrant.id} 
                                            className={`flex items-start gap-3 p-2 rounded-md border transition-colors cursor-pointer text-sm ${
                                                isChecked 
                                                    ? 'bg-white border-blue-200 shadow-sm' 
                                                    : 'bg-white/60 border-slate-200 opacity-70 hover:opacity-100'
                                            }`}
                                        >
                                            {/* El checkbox real nativo controlado */}
                                            <input 
                                                type="checkbox" 
                                                name="selectedRegistrants" 
                                                value={registrant.email}
                                                checked={isChecked}
                                                onChange={() => toggleSelectEmail(registrant.email)}
                                                disabled={isPending}
                                                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <div className="space-y-0.5">
                                                <p className="font-semibold text-slate-800 leading-tight">{registrant.name}</p>
                                                <p className="text-xs text-slate-500 break-all">{registrant.email}</p>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500 text-center py-6">No hay alumnos inscriptos en este curso todavía.</p>
                    )}

                    {/* Botones de Acción finales */}
                    <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                        <Button 
                            type="submit" 
                            disabled={isPending || selectedEmails.length === 0} 
                            className="w-full bg-blue-600 text-white hover:bg-blue-700"
                        >
                            {isPending ? 'Enviando...' : <><Send size={16} className="mr-2" /> Enviar Broadcast</>}
                        </Button>
                        <Link href={`/admin/courses`} className="w-full">
                            <Button type="button" variant="outline" className="w-full" disabled={isPending}>
                                Cancelar
                            </Button>
                        </Link>
                    </div>
                </div>

            </form>
        </div>
    );
}