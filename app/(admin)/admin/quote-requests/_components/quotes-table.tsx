import { fetchFilteredQuotes } from '@/lib/data/quote-data';
import type { QuoteRequestListFilter } from '@/lib/consts/quote-request-consts';
import QuoteRequestsSelectionTable from './quote-requests-selection-table';

export default async function QuotesTable({
  query,
  currentPage,
  filter,
}: {
  query: string;
  currentPage: number;
  filter: QuoteRequestListFilter;
}) {
  const quotes = await fetchFilteredQuotes(query, currentPage, filter);

  if (quotes.length === 0) {
    return (
      <div className="mt-6 rounded-lg border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
        {filter === 'open'
          ? 'No hay solicitudes abiertas.'
          : 'No se encontraron solicitudes con esos filtros.'}
      </div>
    );
  }

  return <QuoteRequestsSelectionTable quotes={quotes} />;
}
