import { Banknote, Calendar, Clock, MapPin, Users } from 'lucide-react';
import {
    formatCourseCapacity,
    formatCoursePrice,
    formatCourseStartDate,
    type CourseDisplayFields,
} from '@/lib/utils/course-display';
import { cn } from '@/lib/utils';

type CourseDetailFactsProps = {
    course: CourseDisplayFields & { activeRegistrations?: number };
    variant?: 'grid' | 'sidebar';
    className?: string;
};

type FactItem = {
    icon: typeof Calendar;
    label: string;
    value: string;
    detail?: string;
    highlight?: boolean;
};

function buildFactItems(
    course: CourseDetailFactsProps['course']
): FactItem[] {
    const formattedDate = formatCourseStartDate(course.startDate);
    const formattedPrice = formatCoursePrice(course.price, course.currency);
    const capacity = formatCourseCapacity(course.maxStudents, course.activeRegistrations);

    const items: FactItem[] = [
        {
            icon: Banknote,
            label: 'Inversión',
            value: formattedPrice,
            highlight: true,
        },
        {
            icon: Clock,
            label: 'Duración',
            value: course.duration,
        },
    ];

    if (formattedDate) {
        items.push({
            icon: Calendar,
            label: 'Fecha de inicio',
            value: formattedDate,
        });
    }

    if (course.schedule) {
        items.push({
            icon: Clock,
            label: 'Horario',
            value: course.schedule,
        });
    }

    if (course.location) {
        items.push({
            icon: MapPin,
            label: 'Ubicación',
            value: course.location,
        });
    }

    items.push({
        icon: Users,
        label: 'Cupos',
        value: capacity.label,
        detail: capacity.detail,
    });

    return items;
}

export function CourseDetailFacts({ course, variant = 'grid', className }: CourseDetailFactsProps) {
    const items = buildFactItems(course);

    if (variant === 'sidebar') {
        return (
            <div className={cn('space-y-3 text-sm text-slate-600', className)}>
                {items.map((item) => (
                    <div key={item.label} className="flex items-start gap-3">
                        <item.icon
                            className={cn(
                                'mt-0.5 shrink-0',
                                item.highlight ? 'text-blue-600' : 'text-slate-400'
                            )}
                            size={18}
                        />
                        <div>
                            <p
                                className={cn(
                                    item.highlight && 'text-lg font-semibold text-slate-900'
                                )}
                            >
                                {item.highlight ? item.value : (
                                    <>
                                        <strong>{item.label}:</strong> {item.value}
                                    </>
                                )}
                            </p>
                            {item.detail && (
                                <p className="mt-0.5 text-xs text-slate-500">{item.detail}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <section className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2', className)}>
            {items.map((item) => (
                <div
                    key={item.label}
                    className="flex items-start gap-3 rounded-lg border bg-white p-4"
                >
                    <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                    <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.value}</p>
                        {item.detail && (
                            <p className="mt-0.5 text-xs text-muted-foreground">{item.detail}</p>
                        )}
                    </div>
                </div>
            ))}
        </section>
    );
}
