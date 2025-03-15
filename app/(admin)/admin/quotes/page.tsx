import QuotesTable from "@/app/ui/quote/table";

export default function Page() {
    return (
        <div>
            Quotes
            <div>
                <QuotesTable query="" currentPage={1}/>
            </div>
        </div>
    )
}