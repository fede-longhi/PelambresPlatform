import { CheckCircle } from 'lucide-react';
import { parseLearningOutcomes } from '@/lib/utils/course-display';

type CourseLearningSectionProps = {
    learningObjective?: string | null;
    learningOutcomes?: string | null;
    variant?: 'public' | 'compact';
};

export function CourseLearningSection({
    learningObjective,
    learningOutcomes,
    variant = 'public',
}: CourseLearningSectionProps) {
    const bulletPoints = parseLearningOutcomes(learningOutcomes);
    const objectiveText =
        learningObjective?.trim() ||
        'En esta capacitación te daremos las herramientas necesarias para dominar esta área.';

    if (variant === 'compact') {
        return (
            <div className="space-y-6">
                {learningObjective && (
                    <section>
                        <h2 className="text-lg font-semibold">Objetivo del curso</h2>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            {learningObjective}
                        </p>
                    </section>
                )}

                {bulletPoints.length > 0 && (
                    <section>
                        <h2 className="text-lg font-semibold">¿Qué vas a aprender?</h2>
                        <ul className="mt-3 space-y-2">
                            {bulletPoints.map((point) => (
                                <li key={point} className="flex gap-2 text-sm text-muted-foreground">
                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                    {point}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>
        );
    }

    return (
        <section>
            <h2 className="mb-6 text-3xl font-bold text-slate-900">¿Qué vas a aprender?</h2>
            <p className="mb-6 text-lg leading-relaxed whitespace-pre-wrap text-slate-600">
                {objectiveText}
            </p>

            {bulletPoints.length > 0 && (
                <ul className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                    {bulletPoints.map((point) => (
                        <li key={point} className="flex items-start gap-4 text-slate-700">
                            <CheckCircle className="mt-1 shrink-0 text-emerald-500" size={24} />
                            <span className="text-lg">{point}</span>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
