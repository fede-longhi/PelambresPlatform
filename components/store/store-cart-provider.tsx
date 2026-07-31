'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  STORE_CART_STORAGE_KEY,
  getStoreCartLineKey,
} from '@/lib/consts/store-cart-consts';
import type { StoreCartLine, StoreProductType } from '@/types/store-definitions';

type StoreCartContextValue = {
  lines: StoreCartLine[];
  itemCount: number;
  isReady: boolean;
  addItem: (input: {
    productId: string;
    productType: StoreProductType;
    quantity?: number;
  }) => void;
  setQuantity: (input: {
    productId: string;
    productType: StoreProductType;
    quantity: number;
  }) => void;
  removeItem: (input: {
    productId: string;
    productType: StoreProductType;
  }) => void;
  clearCart: () => void;
};

const StoreCartContext = createContext<StoreCartContextValue | null>(null);

function normalizeLines(value: unknown): StoreCartLine[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const byKey = new Map<string, StoreCartLine>();

  for (const entry of value) {
    if (!entry || typeof entry !== 'object') {
      continue;
    }
    const productId =
      'productId' in entry && typeof entry.productId === 'string'
        ? entry.productId
        : null;
    const productType =
      'productType' in entry &&
      (entry.productType === 'product' || entry.productType === 'design')
        ? entry.productType
        : null;
    const quantityRaw =
      'quantity' in entry && typeof entry.quantity === 'number'
        ? entry.quantity
        : 1;
    const quantity = Math.max(1, Math.min(99, Math.floor(quantityRaw)));

    if (!productId || !productType) {
      continue;
    }

    const key = getStoreCartLineKey(productType, productId);
    const existing = byKey.get(key);
    if (existing) {
      existing.quantity = Math.min(99, existing.quantity + quantity);
    } else {
      byKey.set(key, { productId, productType, quantity });
    }
  }

  return Array.from(byKey.values());
}

function readStoredLines(): StoreCartLine[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORE_CART_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    return normalizeLines(JSON.parse(raw));
  } catch {
    return [];
  }
}

function writeStoredLines(lines: StoreCartLine[]) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORE_CART_STORAGE_KEY, JSON.stringify(lines));
}

export function StoreCartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<StoreCartLine[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setLines(readStoredLines());
    setIsReady(true);
  }, []);

  const commit = useCallback((next: StoreCartLine[]) => {
    setLines(next);
    writeStoredLines(next);
  }, []);

  const addItem = useCallback(
    (input: {
      productId: string;
      productType: StoreProductType;
      quantity?: number;
    }) => {
      const quantity = Math.max(1, Math.min(99, Math.floor(input.quantity ?? 1)));
      const key = getStoreCartLineKey(input.productType, input.productId);
      const existing = lines.find(
        (line) => getStoreCartLineKey(line.productType, line.productId) === key
      );
      if (existing) {
        commit(
          lines.map((line) =>
            getStoreCartLineKey(line.productType, line.productId) === key
              ? {
                  ...line,
                  quantity: Math.min(99, line.quantity + quantity),
                }
              : line
          )
        );
        return;
      }
      commit([
        ...lines,
        {
          productId: input.productId,
          productType: input.productType,
          quantity,
        },
      ]);
    },
    [commit, lines]
  );

  const setQuantity = useCallback(
    (input: {
      productId: string;
      productType: StoreProductType;
      quantity: number;
    }) => {
      const quantity = Math.floor(input.quantity);
      const key = getStoreCartLineKey(input.productType, input.productId);
      if (quantity <= 0) {
        commit(
          lines.filter(
            (line) =>
              getStoreCartLineKey(line.productType, line.productId) !== key
          )
        );
        return;
      }
      commit(
        lines.map((line) =>
          getStoreCartLineKey(line.productType, line.productId) === key
            ? { ...line, quantity: Math.min(99, quantity) }
            : line
        )
      );
    },
    [commit, lines]
  );

  const removeItem = useCallback(
    (input: { productId: string; productType: StoreProductType }) => {
      const key = getStoreCartLineKey(input.productType, input.productId);
      commit(
        lines.filter(
          (line) => getStoreCartLineKey(line.productType, line.productId) !== key
        )
      );
    },
    [commit, lines]
  );

  const clearCart = useCallback(() => {
    commit([]);
  }, [commit]);

  const itemCount = useMemo(
    () => lines.reduce((sum, line) => sum + line.quantity, 0),
    [lines]
  );

  const value = useMemo(
    () => ({
      lines,
      itemCount,
      isReady,
      addItem,
      setQuantity,
      removeItem,
      clearCart,
    }),
    [lines, itemCount, isReady, addItem, setQuantity, removeItem, clearCart]
  );

  return (
    <StoreCartContext.Provider value={value}>
      {children}
    </StoreCartContext.Provider>
  );
}

export function useStoreCart() {
  const context = useContext(StoreCartContext);
  if (!context) {
    throw new Error('useStoreCart must be used within StoreCartProvider.');
  }
  return context;
}

export function useStoreCartOptional() {
  return useContext(StoreCartContext);
}
