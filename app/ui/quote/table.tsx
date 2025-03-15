import { fetchFilteredQuotes } from "@/app/lib/quote-data";

export default async function QuotesTable({
    query,
    currentPage
}:
{
    query: string,
    currentPage: number
}) {
    const quotes = await fetchFilteredQuotes(query, currentPage);

    return (
        <div>
            {
                quotes?.map((quote) => (
                    <div key={quote.id}>
                        {quote.first_name}
                    </div>
                ))
            }
        </div>
    )
}