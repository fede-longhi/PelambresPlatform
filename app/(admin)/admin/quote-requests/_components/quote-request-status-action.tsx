'use client';

import {
  QUOTE_REQUEST_STATUSES,
  getQuoteRequestStatusLabel,
  type QuoteRequestStatus,
} from '@/lib/consts/quote-request-consts';
import QuoteStatusForm from './quote-status-form';

function isQuoteRequestStatus(status: string): status is QuoteRequestStatus {
  return (QUOTE_REQUEST_STATUSES as readonly string[]).includes(status);
}

export default function QuoteRequestStatusAction({
  quoteRequestId,
  status,
}: {
  quoteRequestId: string;
  status: string;
}) {
  const quoteStatus = isQuoteRequestStatus(status) ? status : null;

  if (!quoteStatus) {
    return <span>{getQuoteRequestStatusLabel(status)}</span>;
  }

  return (
    <QuoteStatusForm
      inline
      quoteRequestId={quoteRequestId}
      status={quoteStatus}
    />
  );
}
