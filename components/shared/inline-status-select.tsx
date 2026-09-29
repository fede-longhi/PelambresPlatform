'use client';

import type { ReactNode } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';

type StatusOption = {
  value: string;
  label: string;
};

export default function InlineStatusSelect({
  id,
  value,
  options,
  disabled = false,
  renderBadge,
  onChange,
}: {
  id: string;
  value: string;
  options: readonly StatusOption[];
  disabled?: boolean;
  renderBadge: (value: string) => ReactNode;
  onChange: (nextValue: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger
        id={id}
        aria-label="Cambiar estado"
        className="h-auto w-auto gap-0 border-0 bg-transparent p-0 shadow-none focus:ring-0 disabled:opacity-60 [&>svg]:hidden"
      >
        {renderBadge(value)}
      </SelectTrigger>
      <SelectContent align="start">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {renderBadge(option.value)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
