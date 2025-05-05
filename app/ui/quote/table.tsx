import { fetchFilteredQuotes } from "@/app/lib/quote-data";
import { formatDateToLocal } from '@/lib/utils';
import Link from "next/link";

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
        <div className="mt-6 flow-root">
            <div className="inline-block min-w-full align-middle">
                <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
                    <div className="md:hidden">
                    {quotes?.map((quote) => (
                        <div
                                key={quote.id}
                                className="mb-2 w-full rounded-md bg-white p-4"
                        >
                            <div className="flex items-center justify-between border-b pb-4">
                                <div>
                                    <div className="mb-2 flex items-center">
                                        <p>{quote.first_name}</p>
                                    </div>
                                    <p className="text-sm text-gray-500">{quote.email}</p>
                                </div>
                            </div>
                            <div className="flex w-full items-center justify-between pt-4">
                                <div>
                                    <p>{formatDateToLocal(quote.date)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <table className="hidden min-w-full text-gray-900 md:table">
                    <thead className="rounded-lg text-left text-sm font-normal">
                      <tr>
                        <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                          Name
                        </th>
                        <th scope="col" className="px-3 py-5 font-medium">
                          Email
                        </th>
                        <th scope="col" className="px-3 py-5 font-medium">
                          Phone
                        </th>
                        <th scope="col" className="px-3 py-5 font-medium">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                        {quotes?.map((quote) => (
                            <tr
                                key={quote.id}
                                className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                            >
                                <td className="whitespace-nowrap py-3 pl-6 pr-3">
                                    <Link  href={`/admin/quotes/${quote.id}`}>
                                        <div className="flex items-center gap-3">
                                            <p>{quote.first_name}, {quote.last_name}</p>
                                        </div>
                                    </Link> 
                                </td>
                                <td className="whitespace-nowrap px-3 py-3">
                                    {quote.email}
                                </td>
                                <td className="whitespace-nowrap px-3 py-3">
                                    {quote.phone}
                                </td>
                                <td className="whitespace-nowrap px-3 py-3">
                                    {formatDateToLocal(quote.date)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
        </div>
    )
}