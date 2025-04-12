import { LastOrderStatusDetail } from "../orders/status-detail";

export default function Dashboard() {
    return (
        <div className="flex flex-col md:flex-row">
            <LastOrderStatusDetail canEdit title="Latest Order" titleClassName="text-center" />
        </div>
    )
}