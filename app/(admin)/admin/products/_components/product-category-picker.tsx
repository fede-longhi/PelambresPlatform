'use client';

import { useEffect, useId, useMemo, useRef, useState, useTransition } from 'react';
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
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { createStoreCategoryInline } from '@/lib/actions/store-category-actions';
import { cn } from '@/lib/utils';
import type {
  StoreCategory,
  StoreProductType,
} from '@/types/store-definitions';

type CategoryOption = Pick<StoreCategory, 'id' | 'name' | 'isActive'>;

type ProductCategoryPickerProps = {
  productType: StoreProductType;
  availableCategories: CategoryOption[];
  selectedIds: string[];
  onChange: (nextIds: string[]) => void;
  disabled?: boolean;
  errorId?: string;
};

function slugifyName(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function CategoryPill({
  category,
  onRemove,
  disabled,
  dragHandleProps,
  setNodeRef,
  style,
  isDragging,
}: {
  category: CategoryOption;
  onRemove: () => void;
  disabled?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
  setNodeRef?: (node: HTMLElement | null) => void;
  style?: React.CSSProperties;
  isDragging?: boolean;
}) {
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
        className="cursor-grab touch-none rounded-full p-1 text-secondary-foreground/60 hover:text-secondary-foreground active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:cursor-default"
        aria-label={`Reordenar ${category.name}`}
        disabled={disabled || !dragHandleProps}
        {...dragHandleProps}
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

  return (
    <CategoryPill
      category={category}
      onRemove={onRemove}
      disabled={disabled}
      setNodeRef={setNodeRef}
      isDragging={isDragging}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      dragHandleProps={{ ...attributes, ...listeners }}
    />
  );
}

export function ProductCategoryPicker({
  productType,
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
  const [localCategories, setLocalCategories] =
    useState<CategoryOption[]>(availableCategories);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createSlug, setCreateSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [createErrors, setCreateErrors] = useState<{
    name?: string[];
    slug?: string[];
  }>({});
  const [createMessage, setCreateMessage] = useState<string | null>(null);
  const [isCreating, startCreateTransition] = useTransition();
  const [isDragReady, setIsDragReady] = useState(false);

  useEffect(() => {
    setIsDragReady(true);
  }, []);

  useEffect(() => {
    setLocalCategories((previous) => {
      const byId = new Map(
        availableCategories.map((category) => [category.id, category])
      );
      for (const category of previous) {
        if (!byId.has(category.id) && selectedIds.includes(category.id)) {
          byId.set(category.id, category);
        }
      }
      return Array.from(byId.values());
    });
  }, [availableCategories, selectedIds]);

  const selectedCategories = useMemo(() => {
    const byId = new Map(
      localCategories.map((category) => [category.id, category])
    );
    return selectedIds
      .map((id) => byId.get(id))
      .filter((category): category is CategoryOption => Boolean(category));
  }, [localCategories, selectedIds]);

  const suggestions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const selectedSet = new Set(selectedIds);

    return localCategories.filter((category) => {
      if (selectedSet.has(category.id)) {
        return false;
      }
      if (!normalizedQuery) {
        return true;
      }
      return category.name.toLowerCase().includes(normalizedQuery);
    });
  }, [localCategories, query, selectedIds]);

  const canOfferCreateFromQuery = useMemo(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      return false;
    }
    const normalized = trimmed.toLowerCase();
    return !localCategories.some(
      (category) => category.name.toLowerCase() === normalized
    );
  }, [localCategories, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, suggestions.length, canOfferCreateFromQuery]);

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

  const openCreateDialog = (prefillName = '') => {
    const nextName = prefillName.trim();
    setCreateName(nextName);
    setCreateSlug(slugifyName(nextName));
    setSlugTouched(false);
    setCreateErrors({});
    setCreateMessage(null);
    setIsOpen(false);
    setIsCreateOpen(true);
  };

  const handleCreateNameChange = (nextName: string) => {
    setCreateName(nextName);
    if (!slugTouched) {
      setCreateSlug(slugifyName(nextName));
    }
  };

  const submitCreate = () => {
    startCreateTransition(async () => {
      setCreateErrors({});
      setCreateMessage(null);

      const result = await createStoreCategoryInline({
        name: createName,
        slug: createSlug,
        productType,
        isActive: true,
      });

      if (!result.success || !result.category) {
        setCreateErrors(result.errors ?? {});
        setCreateMessage(result.message ?? 'No se pudo crear la categoría.');
        return;
      }

      const created: CategoryOption = {
        id: result.category.id,
        name: result.category.name,
        isActive: result.category.isActive,
      };

      setLocalCategories((previous) => {
        if (previous.some((category) => category.id === created.id)) {
          return previous;
        }
        return [...previous, created];
      });
      onChange(
        selectedIds.includes(created.id)
          ? selectedIds
          : [...selectedIds, created.id]
      );
      setQuery('');
      setIsCreateOpen(false);
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (event.key === 'ArrowDown' || event.key === 'Enter')) {
      setIsOpen(true);
      return;
    }

    const createOptionOffset = canOfferCreateFromQuery ? 1 : 0;
    const optionCount = suggestions.length + createOptionOffset;

    if (!isOpen || optionCount === 0) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % optionCount);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + optionCount) % optionCount);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (canOfferCreateFromQuery && activeIndex === suggestions.length) {
        openCreateDialog(query);
        return;
      }
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
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <Label htmlFor="category-search">Categorías (opcional)</Label>
          <p className="mt-1 text-xs text-slate-500">
            La primera es la más importante. Arrastrá las pills para reordenar.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || isCreating}
            onClick={() => openCreateDialog(query)}
          >
            <Plus size={14} className="mr-1" aria-hidden="true" />
            Nueva
          </Button>
          <Link
            href="/admin/categories"
            className="text-xs text-primary hover:underline"
          >
            Gestionar
          </Link>
        </div>
      </div>

      <div className="relative">
        <Input
          id="category-search"
          type="search"
          value={query}
          disabled={disabled || isCreating}
          placeholder="Buscar o crear categoría..."
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
            {suggestions.length === 0 && !canOfferCreateFromQuery ? (
              <li className="px-3 py-2 text-sm text-slate-500">
                {localCategories.length === 0
                  ? 'Todavía no hay categorías. Creá una nueva.'
                  : query.trim()
                    ? 'Sin coincidencias'
                    : 'Todas las categorías ya están agregadas'}
              </li>
            ) : (
              <>
                {suggestions.map((category, index) => (
                  <li
                    key={category.id}
                    role="option"
                    aria-selected={index === activeIndex}
                  >
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
                ))}
                {canOfferCreateFromQuery ? (
                  <li
                    role="option"
                    aria-selected={activeIndex === suggestions.length}
                  >
                    <button
                      type="button"
                      className={cn(
                        'flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-primary hover:bg-slate-100',
                        activeIndex === suggestions.length && 'bg-slate-100'
                      )}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => openCreateDialog(query)}
                    >
                      <Plus size={14} aria-hidden="true" />
                      Crear «{query.trim()}»
                    </button>
                  </li>
                ) : null}
              </>
            )}
          </ul>
        )}
      </div>

      {selectedCategories.length > 0 &&
        (isDragReady ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={selectedIds}
              strategy={horizontalListSortingStrategy}
            >
              <ul
                className="flex flex-wrap gap-2"
                aria-label="Categorías asignadas"
              >
                {selectedCategories.map((category) => (
                  <SortableCategoryPill
                    key={category.id}
                    category={category}
                    disabled={disabled || isCreating}
                    onRemove={() => removeCategory(category.id)}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        ) : (
          <ul className="flex flex-wrap gap-2" aria-label="Categorías asignadas">
            {selectedCategories.map((category) => (
              <CategoryPill
                key={category.id}
                category={category}
                disabled={disabled || isCreating}
                onRemove={() => removeCategory(category.id)}
              />
            ))}
          </ul>
        ))}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva categoría</DialogTitle>
            <DialogDescription>
              Se crea para el tipo actual del artículo y queda seleccionada.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="inline-category-name">Nombre</Label>
              <Input
                id="inline-category-name"
                value={createName}
                disabled={isCreating}
                autoFocus
                onChange={(event) => handleCreateNameChange(event.target.value)}
                aria-invalid={Boolean(createErrors.name)}
              />
              {createErrors.name?.map((error) => (
                <p className="text-xs text-red-500" key={error}>
                  {error}
                </p>
              ))}
            </div>
            <div className="space-y-2">
              <Label htmlFor="inline-category-slug">Slug</Label>
              <Input
                id="inline-category-slug"
                value={createSlug}
                disabled={isCreating}
                onChange={(event) => {
                  setSlugTouched(true);
                  setCreateSlug(event.target.value);
                }}
                aria-invalid={Boolean(createErrors.slug)}
              />
              {createErrors.slug?.map((error) => (
                <p className="text-xs text-red-500" key={error}>
                  {error}
                </p>
              ))}
            </div>
            {createMessage ? (
              <p className="text-sm text-red-500" aria-live="polite">
                {createMessage}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isCreating}
              onClick={() => setIsCreateOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={isCreating || createName.trim().length < 2}
              onClick={submitCreate}
            >
              {isCreating ? 'Creando…' : 'Crear y agregar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
