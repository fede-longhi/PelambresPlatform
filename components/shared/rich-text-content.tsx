import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import {
  isRichTextEmpty,
  RICH_TEXT_CONTENT_CLASS_NAME,
  sanitizeRichTextHtml,
} from '@/lib/utils/sanitize-html';

type RichTextContentProps = {
  html: string | null | undefined;
  className?: string;
  emptyFallback?: ReactNode;
};

export function RichTextContent({
  html,
  className,
  emptyFallback = null,
}: RichTextContentProps) {
  if (isRichTextEmpty(html)) {
    return emptyFallback;
  }

  const sanitizedHtml = sanitizeRichTextHtml(html!);

  return (
    <div
      className={cn(RICH_TEXT_CONTENT_CLASS_NAME, className)}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
