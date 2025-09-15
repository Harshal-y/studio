import { TeleIcuDashboard } from "@/components/tele-icu-dashboard";
import { DataProvider } from "@/contexts/data-provider";


export default function DoctorPortalPage() {
    return (
        <DataProvider>
            <div className="min-h-screen bg-background">
                <TeleIcuDashboard />
            </div>
        </DataProvider>
    )
}
