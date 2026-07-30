'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Download, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const isDesign = productType === 'design';
  const hasMultiple = images.length > 1;
  const activeImage = images[activeIndex] ?? images[0] ?? null;

  const goToPrevious = useCallback(() => {
    if (!hasMultiple) return;
    setActiveIndex((current) =>
      current === 0 ? images.length - 1 : current - 1
    );
  }, [hasMultiple, images.length]);

  const goToNext = useCallback(() => {
    if (!hasMultiple) return;
    setActiveIndex((current) =>
      current === images.length - 1 ? 0 : current + 1
    );
  }, [hasMultiple, images.length]);

  useEffect(() => {
    if (!lightboxOpen || !hasMultiple) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goToPrevious();
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goToNext();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxOpen, hasMultiple, goToPrevious, goToNext]);

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {activeImage ? (
          <>
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="absolute inset-0 z-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
              aria-label={`Ampliar foto de ${productName}`}
            >
              <Image
                src={activeImage.url}
                alt={productName}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-300 hover:scale-[1.02]"
                priority
              />
            </button>

            {hasMultiple ? (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={goToPrevious}
                  aria-label="Foto anterior"
                  className="absolute left-3 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full bg-white/90 shadow-md hover:bg-white"
                >
                  <ChevronLeft size={20} aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={goToNext}
                  aria-label="Foto siguiente"
                  className="absolute right-3 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full bg-white/90 shadow-md hover:bg-white"
                >
                  <ChevronRight size={20} aria-hidden="true" />
                </Button>
                <p className="pointer-events-none absolute bottom-3 right-3 z-10 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
                  {activeIndex + 1} / {images.length}
                </p>
              </>
            ) : null}
          </>
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

      {hasMultiple ? (
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

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-h-[95vh] max-w-[min(96vw,960px)] overflow-hidden border-0 bg-black/95 p-0 text-white sm:rounded-2xl">
          <DialogTitle className="sr-only">
            Foto ampliada de {productName}
          </DialogTitle>

          {activeImage ? (
            <div className="relative flex min-h-[50vh] items-center justify-center p-4 sm:p-8">
              <img
                src={activeImage.url}
                alt={productName}
                className="max-h-[80vh] max-w-full object-contain"
              />

              {hasMultiple ? (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    onClick={goToPrevious}
                    aria-label="Foto anterior"
                    className="absolute left-3 top-1/2 h-11 w-11 -translate-y-1/2 rounded-full"
                  >
                    <ChevronLeft size={22} aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    onClick={goToNext}
                    aria-label="Foto siguiente"
                    className="absolute right-3 top-1/2 h-11 w-11 -translate-y-1/2 rounded-full"
                  >
                    <ChevronRight size={22} aria-hidden="true" />
                  </Button>
                </>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
