import QuoteBuilder from '@/components/quote-builder/QuoteBuilder';
import type { QuoteBuilderProps } from '@/components/quote-builder/QuoteBuilder';

export default function QuoteDocumentBuilder(props: QuoteBuilderProps) {
  return (
    <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-border">
      <QuoteBuilder {...props} mode="admin" />
    </div>
  );
}
