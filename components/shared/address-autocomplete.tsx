'use client';

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { formatShortAddress } from '@/lib/places/address-format';
import { MapPin } from 'lucide-react';

type PlaceSuggestion = {
  placeId: string;
  text: string;
  mainText: string;
  secondaryText: string;
};

type AddressAutocompleteProps = {
  id?: string;
  name?: string;
  label?: string;
  /** Full address stored in the form / DB */
  value: string;
  onChange: (fullAddress: string) => void;
  disabled?: boolean;
  className?: string;
  errorId?: string;
  'aria-invalid'?: boolean;
};

function createSessionToken() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function AddressAutocomplete({
  id,
  name = 'address',
  label = 'Dirección',
  value,
  onChange,
  disabled = false,
  className,
  errorId,
  'aria-invalid': ariaInvalid,
}: AddressAutocompleteProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const listboxId = `${inputId}-suggestions`;
  const containerRef = useRef<HTMLDivElement>(null);
  const sessionTokenRef = useRef(createSessionToken());
  const [displayValue, setDisplayValue] = useState(() => formatShortAddress(value));
  const [fullAddress, setFullAddress] = useState(value);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (value === fullAddress) {
      return;
    }

    setFullAddress(value);
    setDisplayValue(formatShortAddress(value));
    setSearchQuery('');
    setSuggestions([]);
    setIsOpen(false);
  }, [value, fullAddress]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  useEffect(() => {
    const query = searchQuery.trim();

    if (disabled || query.length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetch('/api/places/autocomplete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: query,
            sessionToken: sessionTokenRef.current,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('autocomplete_failed');
        }

        const data = (await response.json()) as { suggestions?: PlaceSuggestion[] };
        const nextSuggestions = data.suggestions ?? [];
        setSuggestions(nextSuggestions);
        setIsOpen(nextSuggestions.length > 0);
        setActiveIndex(-1);
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          return;
        }
        setSuggestions([]);
        setIsOpen(false);
        setErrorMessage(
          'No se pudieron cargar sugerencias. Podés escribir la dirección a mano.'
        );
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [searchQuery, disabled]);

  function commitManualAddress(nextDisplay: string) {
    setDisplayValue(nextDisplay);
    setFullAddress(nextDisplay);
    setSearchQuery(nextDisplay);
    onChange(nextDisplay);
  }

  async function selectSuggestion(suggestion: PlaceSuggestion) {
    setIsOpen(false);
    setSuggestions([]);
    setActiveIndex(-1);
    setSearchQuery('');
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/places/details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placeId: suggestion.placeId,
          sessionToken: sessionTokenRef.current,
        }),
      });

      if (!response.ok) {
        throw new Error('details_failed');
      }

      const data = (await response.json()) as {
        formattedAddress?: string;
        shortAddress?: string;
      };
      const nextFull = data.formattedAddress?.trim() || suggestion.text;
      const nextShort =
        data.shortAddress?.trim() || formatShortAddress(nextFull) || suggestion.mainText;

      setDisplayValue(nextShort);
      setFullAddress(nextFull);
      onChange(nextFull);
    } catch {
      const fallback = suggestion.text;
      setDisplayValue(formatShortAddress(fallback) || suggestion.mainText);
      setFullAddress(fallback);
      onChange(fallback);
      setErrorMessage(
        'Usamos la sugerencia seleccionada. Revisá que la dirección esté completa.'
      );
    } finally {
      setIsLoading(false);
      sessionTokenRef.current = createSessionToken();
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || suggestions.length === 0) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % suggestions.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) =>
        current <= 0 ? suggestions.length - 1 : current - 1
      );
      return;
    }

    if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      void selectSuggestion(suggestions[activeIndex]);
      return;
    }

    if (event.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div ref={containerRef} className={cn('relative space-y-2', className)}>
      <Label htmlFor={inputId}>{label}</Label>
      <input type="hidden" name={name} value={fullAddress} />
      <div className="relative">
        <MapPin
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id={inputId}
          value={displayValue}
          disabled={disabled}
          autoComplete="street-address"
          aria-invalid={ariaInvalid}
          aria-describedby={errorId}
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded={isOpen}
          role="combobox"
          className="pl-9"
          placeholder="Empezá a escribir tu dirección..."
          onChange={(event) => commitManualAddress(event.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
        />
      </div>

      {isLoading && (
        <p className="text-xs text-muted-foreground" role="status">
          Buscando direcciones...
        </p>
      )}

      {errorMessage && (
        <p className="text-xs text-muted-foreground" role="status">
          {errorMessage}
        </p>
      )}

      {isOpen && suggestions.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white py-1 shadow-md"
        >
          {suggestions.map((suggestion, index) => (
            <li key={suggestion.placeId} role="option" aria-selected={index === activeIndex}>
              <button
                type="button"
                className={cn(
                  'flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-muted',
                  index === activeIndex && 'bg-muted'
                )}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => void selectSuggestion(suggestion)}
              >
                <span className="font-medium">{suggestion.mainText}</span>
                {suggestion.secondaryText ? (
                  <span className="text-xs text-muted-foreground">
                    {suggestion.secondaryText}
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
