'use client';

import { useEffect, useId, useRef, useState } from 'react';
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
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ImagePlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  STORE_PRODUCT_IMAGE_ALLOWED_EXTENSIONS,
  STORE_PRODUCT_IMAGE_MAX_COUNT,
  STORE_PRODUCT_IMAGE_MAX_SIZE_BYTES,
} from '@/lib/consts/store-consts';
import { cn, formatFileSize } from '@/lib/utils';
import type { StoreProductImage } from '@/types/store-definitions';

type ExistingGalleryItem = {
  key: string;
  kind: 'existing';
  id: string;
  url: string;
};

type NewGalleryItem = {
  key: string;
  kind: 'new';
  file: File;
  previewUrl: string;
};

type GalleryItem = ExistingGalleryItem | NewGalleryItem;

type ProductImagesInputProps = {
  initialImages?: StoreProductImage[];
  disabled?: boolean;
  errorId?: string;
};

function getFileExtension(fileName: string): string {
  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex < 0) {
    return '';
  }
  return fileName.slice(lastDotIndex + 1).toLowerCase();
}

function HiddenFileInput({ file }: { file: File }) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) {
      return;
    }
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    input.files = dataTransfer.files;
  }, [file]);

  return <input ref={inputRef} type="file" name="images" className="hidden" />;
}

function ImageTileChrome({
  previewUrl,
  index,
  disabled,
  onRemove,
  dragHandleProps,
  setNodeRef,
  style,
  isDragging,
}: {
  previewUrl: string;
  index: number;
  disabled?: boolean;
  onRemove: () => void;
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
        'relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-50',
        isDragging && 'z-10 shadow-md'
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={previewUrl} alt="" className="h-full w-full object-cover" />
      {index === 0 ? (
        <span className="absolute left-1.5 top-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
          Portada
        </span>
      ) : null}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/60 to-transparent p-1.5">
        <button
          type="button"
          className="rounded p-1 text-white/90 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-default disabled:opacity-50"
          aria-label="Reordenar imagen"
          disabled={disabled || !dragHandleProps}
          {...dragHandleProps}
        >
          <GripVertical size={14} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="rounded p-1 text-white/90 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-50"
          aria-label="Quitar imagen"
          disabled={disabled}
          onClick={onRemove}
        >
          <X size={14} aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}

function SortableImageTile({
  item,
  index,
  disabled,
  onRemove,
}: {
  item: GalleryItem;
  index: number;
  disabled?: boolean;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.key, disabled });

  return (
    <ImageTileChrome
      previewUrl={item.kind === 'existing' ? item.url : item.previewUrl}
      index={index}
      disabled={disabled}
      onRemove={onRemove}
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

export function ProductImagesInput({
  initialImages = [],
  disabled,
  errorId,
}: ProductImagesInputProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<GalleryItem[]>(() =>
    initialImages.map((image) => ({
      key: `existing-${image.id}`,
      kind: 'existing' as const,
      id: image.id,
      url: image.url,
    }))
  );
  const [localError, setLocalError] = useState<string | null>(null);
  const [isDragReady, setIsDragReady] = useState(false);

  useEffect(() => {
    setIsDragReady(true);
  }, []);

  useEffect(() => {
    return () => {
      for (const item of items) {
        if (item.kind === 'new') {
          URL.revokeObjectURL(item.previewUrl);
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const remainingSlots = STORE_PRODUCT_IMAGE_MAX_COUNT - items.length;
  const newFiles = items.filter(
    (item): item is NewGalleryItem => item.kind === 'new'
  );

  const addFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) {
      return;
    }

    setLocalError(null);
    const incoming = Array.from(fileList);
    const nextItems = [...items];
    const errors: string[] = [];

    for (const file of incoming) {
      if (nextItems.length >= STORE_PRODUCT_IMAGE_MAX_COUNT) {
        errors.push(
          `Podés subir hasta ${STORE_PRODUCT_IMAGE_MAX_COUNT} imágenes.`
        );
        break;
      }

      const extension = getFileExtension(file.name);
      if (!STORE_PRODUCT_IMAGE_ALLOWED_EXTENSIONS.has(extension)) {
        errors.push(`${file.name}: usá JPG, PNG, WEBP o GIF.`);
        continue;
      }
      if (file.size > STORE_PRODUCT_IMAGE_MAX_SIZE_BYTES) {
        errors.push(
          `${file.name}: supera ${formatFileSize(STORE_PRODUCT_IMAGE_MAX_SIZE_BYTES)}.`
        );
        continue;
      }

      nextItems.push({
        key: `new-${crypto.randomUUID()}`,
        kind: 'new',
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    setItems(nextItems);
    if (errors.length > 0) {
      setLocalError(errors[0]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeItem = (key: string) => {
    setItems((current) => {
      const target = current.find((item) => item.key === key);
      if (target?.kind === 'new') {
        URL.revokeObjectURL(target.previewUrl);
      }
      return current.filter((item) => item.key !== key);
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    setItems((current) => {
      const oldIndex = current.findIndex((item) => item.key === String(active.id));
      const newIndex = current.findIndex((item) => item.key === String(over.id));
      if (oldIndex < 0 || newIndex < 0) {
        return current;
      }
      return arrayMove(current, oldIndex, newIndex);
    });
  };

  let newFileCounter = 0;

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor={inputId}>Imágenes</Label>
        <p className="mt-1 text-xs text-slate-500">
          La primera es la portada. Hasta {STORE_PRODUCT_IMAGE_MAX_COUNT}. Arrastrá
          para reordenar.
        </p>
      </div>

      {items.length > 0 ? (
        isDragReady ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map((item) => item.key)}
              strategy={rectSortingStrategy}
            >
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {items.map((item, index) => (
                  <SortableImageTile
                    key={item.key}
                    item={item}
                    index={index}
                    disabled={disabled}
                    onRemove={() => removeItem(item.key)}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {items.map((item, index) => (
              <ImageTileChrome
                key={item.key}
                previewUrl={item.kind === 'existing' ? item.url : item.previewUrl}
                index={index}
                disabled={disabled}
                onRemove={() => removeItem(item.key)}
              />
            ))}
          </ul>
        )
      ) : (
        <p className="text-sm text-slate-500">Todavía no hay imágenes.</p>
      )}

      {items.map((item) => {
        if (item.kind === 'existing') {
          return (
            <input
              key={`order-${item.key}`}
              type="hidden"
              name="imageOrder"
              value={`existing:${item.id}`}
            />
          );
        }
        const submitIndex = newFileCounter;
        newFileCounter += 1;
        return (
          <input
            key={`order-${item.key}`}
            type="hidden"
            name="imageOrder"
            value={`new:${submitIndex}`}
          />
        );
      })}

      {newFiles.map((item) => (
        <HiddenFileInput key={`file-${item.key}`} file={item.file} />
      ))}

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={fileInputRef}
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="sr-only"
          disabled={disabled || remainingSlots <= 0}
          aria-describedby={errorId}
          onChange={(event) => addFiles(event.target.files)}
        />
        <Button
          type="button"
          variant="outline"
          disabled={disabled || remainingSlots <= 0}
          onClick={() => fileInputRef.current?.click()}
        >
          <ImagePlus size={16} className="mr-2" aria-hidden="true" />
          Agregar imágenes
        </Button>
        <span className="text-xs text-slate-500">
          {items.length}/{STORE_PRODUCT_IMAGE_MAX_COUNT}
        </span>
      </div>

      {localError ? (
        <p className="text-xs text-red-500" role="alert">
          {localError}
        </p>
      ) : null}
    </div>
  );
}
