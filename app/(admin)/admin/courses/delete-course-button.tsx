'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deleteCourse } from '@/lib/actions/course-actions';

export function DeleteCourseButton({ courseId, courseTitle }: { courseId: string, courseTitle: string }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        const confirmDelete = window.confirm(
            `¿Estás seguro de que querés eliminar el curso "${courseTitle}"? Los inscriptos no se perderán, pero el curso ya no será visible.`
        );

        if (confirmDelete) {
            setIsDeleting(true);
            try {
                await deleteCourse(courseId);
            } catch (error) {
                console.error(error);
                alert('Hubo un error al eliminar el curso.');
                setIsDeleting(false);
            }
        }
    };

    return (
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-slate-400 hover:text-red-600 disabled:opacity-50"
            title="Eliminar curso"
        >
            <Trash2 size={18} />
        </Button>
    );
}