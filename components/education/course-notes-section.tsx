import { Info } from 'lucide-react';

type CourseNotesSectionProps = {
    notes: string;
    variant?: 'public' | 'compact';
};

export function CourseNotesSection({ notes, variant = 'public' }: CourseNotesSectionProps) {
    if (variant === 'compact') {
        return (
            <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex gap-2">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                    <div>
                        <p className="text-sm font-medium text-amber-900">Información adicional</p>
                        <p className="mt-1 whitespace-pre-line text-sm text-amber-800">{notes}</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
            <div className="mb-3 flex items-center gap-2 font-bold text-amber-800">
                <Info size={20} />
                Aclaraciones importantes
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{notes}</p>
        </section>
    );
}
