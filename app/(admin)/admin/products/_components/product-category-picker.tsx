'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
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
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { StoreCategory } from '@/types/store-definitions';

type CategoryOption = Pick<StoreCategory, 'id' | 'name' | 'isActive'>;

type ProductCategoryPickerProps = {
  availableCategories: CategoryOption[];
  selectedIds: string[];
  onChange: (nextIds: string[]) => void;
  disabled?: boolean;
  errorId?: string;
};

function SortableCategoryPill({
  category,
  onRemove,
  disabled,
}: {
  category: CategoryOption;
  onRemove: () => void;
  disabled?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-secondary bg-secondary pl-1 pr-1 py-1 text-sm text-secondary-foreground',
        isDragging && 'z-10 shadow-md'
      )}
    >
      <button
        type="button"
        className="cursor-grab touch-none rounded-full p-1 text-secondary-foreground/60 hover:text-secondary-foreground active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
        aria-label={`Reordenar ${category.name}`}
        disabled={disabled}
        {...attributes}
        {...listeners}
      >
        <GripVertical size={14} aria-hidden="true" />
      </button>
      <span className="max-w-[10rem] truncate pr-1">
        {category.name}
        {!category.isActive ? ' (inactiva)' : ''}
      </span>
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        className="rounded-full p-1 text-secondary-foreground/60 hover:bg-black/10 hover:text-secondary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:opacity-50"
        aria-label={`Quitar ${category.name}`}
      >
        <X size={14} aria-hidden="true" />
      </button>
      <input type="hidden" name="categoryIds" value={category.id} />
    </li>
  );
}

export function ProductCategoryPicker({
  availableCategories,
  selectedIds,
  onChange,
  disabled,
  errorId,
}: ProductCategoryPickerProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const selectedCategories = useMemo(() => {
    const byId = new Map(
      availableCategories.map((category) => [category.id, category])
    );
    return selectedIds
      .map((id) => byId.get(id))
      .filter((category): category is CategoryOption => Boolean(category));
  }, [availableCategories, selectedIds]);

  const suggestions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const selectedSet = new Set(selectedIds);

    return availableCategories.filter((category) => {
      if (selectedSet.has(category.id)) {
        return false;
      }
      if (!normalizedQuery) {
        return true;
      }
      return category.name.toLowerCase().includes(normalizedQuery);
    });
  }, [availableCategories, query, selectedIds]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, suggestions.length]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addCategory = (categoryId: string) => {
    if (selectedIds.includes(categoryId)) {
      return;
    }
    onChange([...selectedIds, categoryId]);
    setQuery('');
    setIsOpen(false);
  };

  const removeCategory = (categoryId: string) => {
    onChange(selectedIds.filter((id) => id !== categoryId));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = selectedIds.indexOf(String(active.id));
    const newIndex = selectedIds.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    onChange(arrayMove(selectedIds, oldIndex, newIndex));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (event.key === 'ArrowDown' || event.key === 'Enter')) {
      setIsOpen(true);
      return;
    }

    if (!isOpen || suggestions.length === 0) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % suggestions.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex(
        (index) => (index - 1 + suggestions.length) % suggestions.length
      );
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const suggestion = suggestions[activeIndex];
      if (suggestion) {
        addCategory(suggestion.id);
      }
      return;
    }

    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="space-y-3" ref={rootRef}>
      <div>
        <Label htmlFor="category-search">Categorías (opcional)</Label>
        <p className="mt-1 text-xs text-slate-500">
          La primera es la más importante. Arrastrá las pills para reordenar.
        </p>
      </div>

      {availableCategories.length === 0 ? (
        <p className="text-sm text-slate-500">
          No hay categorías para este tipo.
        </p>
      ) : (
        <div className="relative">
          <Input
            id="category-search"
            type="search"
            value={query}
            disabled={disabled}
            placeholder="Buscar y agregar categoría..."
            autoComplete="off"
            role="combobox"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-describedby={errorId}
            onFocus={() => setIsOpen(true)}
            onChange={(event) => {
              setQuery(event.target.value);
              setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
          />

          {isOpen && (
            <ul
              id={listboxId}
              role="listbox"
              className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg"
            >
              {suggestions.length === 0 ? (
                <li className="px-3 py-2 text-sm text-slate-500">
                  {query.trim()
                    ? 'Sin coincidencias'
                    : 'Todas las categorías ya están agregadas'}
                </li>
              ) : (
                suggestions.map((category, index) => (
                  <li key={category.id} role="option" aria-selected={index === activeIndex}>
                    <button
                      type="button"
                      className={cn(
                        'flex w-full items-center px-3 py-2 text-left text-sm text-slate-800 hover:bg-slate-100',
                        index === activeIndex && 'bg-slate-100'
                      )}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => addCategory(category.id)}
                    >
                      {category.name}
                      {!category.isActive ? (
                        <span className="ml-2 text-xs text-slate-400">
                          inactiva
                        </span>
                      ) : null}
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      )}

      {selectedCategories.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={selectedIds}
            strategy={horizontalListSortingStrategy}
          >
            <ul className="flex flex-wrap gap-2" aria-label="Categorías asignadas">
              {selectedCategories.map((category) => (
                <SortableCategoryPill
                  key={category.id}
                  category={category}
                  disabled={disabled}
                  onRemove={() => removeCategory(category.id)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
