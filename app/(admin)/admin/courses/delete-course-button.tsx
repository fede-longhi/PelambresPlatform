'use client';

import { Trash2 } from 'lucide-react';
import { deleteCourse } from '@/lib/actions/course-actions';
import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button';

export function DeleteCourseButton({ courseId, courseTitle }: { courseId: string, courseTitle: string }) {
    return (
        <ConfirmDeleteButton
            variant="ghost"
            className="text-muted-foreground hover:text-destructive"
            ariaLabel={`Eliminar curso ${courseTitle}`}
            title="Eliminar curso"
            description={`Se ocultará "${courseTitle}". Los inscriptos no se perderán.`}
            onConfirm={() => deleteCourse(courseId)}
            icon={<Trash2 className="size-4" aria-hidden="true" />}
        />
    );
}
