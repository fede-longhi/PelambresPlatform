'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Download, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StoreProductImage, StoreProductType } from '@/types/store-definitions';

type StoreProductGalleryProps = {
  images: StoreProductImage[];
  productName: string;
  productType: StoreProductType;
};

export function StoreProductGallery({
  images,
  productName,
  productType,
}: StoreProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const isDesign = productType === 'design';
  const activeImage = images[activeIndex] ?? images[0] ?? null;

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {activeImage ? (
          <Image
            src={activeImage.url}
            alt={productName}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-300">
            {isDesign ? (
              <Download size={64} aria-hidden="true" />
            ) : (
              <Package size={64} aria-hidden="true" />
            )}
          </div>
        )}
      </div>

      {images.length > 1 ? (
        <ul className="grid grid-cols-4 gap-2 sm:grid-cols-5" aria-label="Galería">
          {images.map((image, index) => {
            const isActive = index === activeIndex;
            return (
              <li key={image.id}>
                <button
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Ver imagen ${index + 1}`}
                  aria-current={isActive ? 'true' : undefined}
                  className={cn(
                    'relative aspect-square w-full overflow-hidden rounded-lg border bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isActive
                      ? 'border-slate-900 ring-1 ring-slate-900'
                      : 'border-slate-200 hover:border-slate-400'
                  )}
                >
                  <Image
                    src={image.url}
                    alt=""
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
