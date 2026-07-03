import Link from 'next/link';
import { ArrowRight, Banknote, Calendar, Clock, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CourseBadges } from '@/components/education/course-badges';
import {
    formatCoursePrice,
    formatCourseStartDate,
    getCourseLevelLabel,
} from '@/lib/utils/course-display';
import type { PublishedCourseCatalogItem } from '@/lib/data/course-data';

type CourseCatalogCardProps = {
    course: PublishedCourseCatalogItem;
};

export function CourseCatalogCard({ course }: CourseCatalogCardProps) {
    const formattedDate = formatCourseStartDate(course.startDate);
    const formattedPrice = formatCoursePrice(course.price, course.currency);
    const levelLabel = getCourseLevelLabel(course.level);

    return (
        <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
            <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
                <CourseBadges modality={course.modality} level={course.level} />
            </div>

            <div className="flex flex-1 flex-col p-6">
                <h3 className="mb-3 text-xl font-bold text-slate-900 transition-colors group-hover:text-blue-600">
                    {course.title}
                </h3>
                <p className="mb-6 line-clamp-3 flex-1 text-sm text-slate-600">
                    {course.shortDescription}
                </p>

                <div className="mb-6 grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
                        <Clock size={14} className="shrink-0 text-slate-400" />
                        {course.duration}
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
                        <Target size={14} className="shrink-0 text-slate-400" />
                        {levelLabel}
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
                        <Banknote size={14} className="shrink-0 text-slate-400" />
                        {formattedPrice}
                    </div>
                    {formattedDate ? (
                        <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
                            <Calendar size={14} className="shrink-0 text-slate-400" />
                            {formattedDate}
                        </div>
                    ) : (
                        <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-400">
                            Fecha a confirmar
                        </div>
                    )}
                </div>

                <Link href={`/education/${course.slug}`} className="mt-auto block w-full">
                    <Button className="w-full bg-slate-900 text-white hover:bg-slate-800">
                        Ver detalles <ArrowRight size={16} className="ml-2" />
                    </Button>
                </Link>
            </div>
        </article>
    );
}
