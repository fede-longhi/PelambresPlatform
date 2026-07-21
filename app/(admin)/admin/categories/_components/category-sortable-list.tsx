'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  deleteStoreCategory,
  reorderStoreCategories,
} from '@/lib/actions/store-category-actions';
import { getStoreProductTypeLabel } from '@/lib/consts/store-consts';
import type { StoreCategory, StoreProductType } from '@/types/store-definitions';

type CategorySortableListProps = {
  productType: StoreProductType;
  initialCategories: StoreCategory[];
};

function SortableCategoryRow({
  category,
  onDelete,
  isDeleting,
}: {
  category: StoreCategory;
  onDelete: (id: string, name: string) => void;
  isDeleting: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3 ${
        isDragging ? 'z-10 shadow-md' : ''
      }`}
    >
      <button
        type="button"
        className="cursor-grab touch-none rounded p-1 text-slate-400 hover:text-slate-700 active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
        aria-label={`Reordenar ${category.name}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical size={18} aria-hidden="true" />
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-slate-900">{category.name}</p>
        <p className="truncate font-mono text-xs text-slate-500">{category.slug}</p>
      </div>

      {category.isActive ? (
        <Badge>Activa</Badge>
      ) : (
        <Badge variant="secondary">Inactiva</Badge>
      )}

      <Button variant="ghost" size="icon" asChild title="Editar categoría">
        <Link href={`/admin/categories/${category.id}/edit`}>
          <Pencil size={16} />
        </Link>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        type="button"
        title="Eliminar categoría"
        disabled={isDeleting}
        className="text-slate-400 hover:text-red-600"
        onClick={() => onDelete(category.id, category.name)}
      >
        <Trash2 size={16} />
      </Button>
    </li>
  );
}

export function CategorySortableList({
  productType,
  initialCategories,
}: CategorySortableListProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const categoryIds = useMemo(
    () => categories.map((category) => category.id),
    [categories]
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = categories.findIndex(
      (category) => category.id === String(active.id)
    );
    const newIndex = categories.findIndex(
      (category) => category.id === String(over.id)
    );

    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    const previous = categories;
    const next = arrayMove(categories, oldIndex, newIndex);
    setCategories(next);
    setErrorMessage(null);

    startTransition(async () => {
      try {
        await reorderStoreCategories(
          productType,
          next.map((category) => category.id)
        );
      } catch (error) {
        console.error(error);
        setCategories(previous);
        setErrorMessage('No se pudo guardar el nuevo orden. Intentá de nuevo.');
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    const confirmed = window.confirm(
      `¿Eliminar la categoría "${name}"? Los artículos asociados quedarán sin categoría.`
    );
    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      try {
        await deleteStoreCategory(id);
      } catch (error) {
        console.error(error);
        setErrorMessage('No se pudo eliminar la categoría.');
      }
    });
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">
          {getStoreProductTypeLabel(productType)}
        </h2>
        {isPending && (
          <p className="text-xs text-slate-500" aria-live="polite">
            Guardando…
          </p>
        )}
      </div>

      {errorMessage && (
        <p className="text-sm text-red-600" role="alert">
          {errorMessage}
        </p>
      )}

      {categories.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
          Todavía no hay categorías de {getStoreProductTypeLabel(productType).toLowerCase()}.
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={categoryIds}
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-2">
              {categories.map((category) => (
                <SortableCategoryRow
                  key={category.id}
                  category={category}
                  onDelete={handleDelete}
                  isDeleting={isPending}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </section>
  );
}
