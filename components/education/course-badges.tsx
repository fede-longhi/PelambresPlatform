import { getCourseLevelLabel, getCourseModalityLabel } from '@/lib/utils/course-display';
import { cn } from '@/lib/utils';

type CourseBadgesProps = {
    modality: string;
    level: string;
    className?: string;
    variant?: 'hero' | 'default';
};

export function CourseBadges({ modality, level, className, variant = 'default' }: CourseBadgesProps) {
    const modalityLabel = getCourseModalityLabel(modality);
    const levelLabel = getCourseLevelLabel(level);

    if (variant === 'hero') {
        return (
            <div className={cn('flex flex-wrap gap-2', className)}>
                <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                    {modalityLabel}
                </span>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Nivel {levelLabel}
                </span>
            </div>
        );
    }

    return (
        <div className={cn('flex flex-wrap gap-2', className)}>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                {modalityLabel}
            </span>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Nivel {levelLabel}
            </span>
        </div>
    );
}
