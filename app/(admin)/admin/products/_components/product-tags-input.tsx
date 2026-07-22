'use client';

import { useId, useState } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  normalizeStoreTags,
  STORE_PRODUCT_TAG_MAX_COUNT,
  STORE_PRODUCT_TAG_MAX_LENGTH,
} from '@/lib/consts/store-consts';

type ProductTagsInputProps = {
  initialTags?: string[];
  disabled?: boolean;
  errorId?: string;
};

export function ProductTagsInput({
  initialTags = [],
  disabled,
  errorId,
}: ProductTagsInputProps) {
  const inputId = useId();
  const [tags, setTags] = useState(() => normalizeStoreTags(initialTags));
  const [draft, setDraft] = useState('');

  const addFromDraft = () => {
    const nextTags = normalizeStoreTags([...tags, draft]);
    setTags(nextTags);
    setDraft('');
  };

  const removeTag = (tagToRemove: string) => {
    setTags((current) =>
      current.filter(
        (tag) => tag.toLowerCase() !== tagToRemove.toLowerCase()
      )
    );
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addFromDraft();
      return;
    }

    if (event.key === 'Backspace' && draft.length === 0 && tags.length > 0) {
      event.preventDefault();
      setTags((current) => current.slice(0, -1));
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor={inputId}>Tags (opcional)</Label>
        <p className="mt-1 text-xs text-slate-500">
          Palabras simples para el buscador. Enter o coma para agregar. Hasta{' '}
          {STORE_PRODUCT_TAG_MAX_COUNT}.
        </p>
      </div>

      <Input
        id={inputId}
        type="text"
        value={draft}
        disabled={disabled || tags.length >= STORE_PRODUCT_TAG_MAX_COUNT}
        placeholder="Ej: pla, engranaje, miniatura"
        maxLength={STORE_PRODUCT_TAG_MAX_LENGTH}
        autoComplete="off"
        aria-describedby={errorId}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (draft.trim()) {
            addFromDraft();
          }
        }}
      />

      {tags.length > 0 ? (
        <ul className="flex flex-wrap gap-2" aria-label="Tags del artículo">
          {tags.map((tag) => (
            <li
              key={tag.toLowerCase()}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 py-1 pl-3 pr-1 text-sm text-slate-700"
            >
              <span>{tag}</span>
              <button
                type="button"
                disabled={disabled}
                onClick={() => removeTag(tag)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:opacity-50"
                aria-label={`Quitar tag ${tag}`}
              >
                <X size={14} aria-hidden="true" />
              </button>
              <input type="hidden" name="tags" value={tag} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
