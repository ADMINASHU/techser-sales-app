import { auth } from "@/auth";
import { getLocations } from "@/app/actions/settingsActions";
import LocationManager from "@/components/LocationManager";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
    const session = await auth();
    if (!session) redirect("/login");

    // If not admin, maybe show nothing or generic settings
    // For now, since only location settings exist, we restrict or show message
    const isAdmin = session.user.role === "admin";

    if (!isAdmin) {
        return (
            <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Settings</h1>
                </div>
                <div className="p-4 border rounded-md bg-muted/50">
                    <p>No settings available for your account type.</p>
                </div>
            </div>
        );
    }

    const locations = await getLocations();

    return (
        <div className="space-y-6">
             <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Settings</h1>
            </div>
            
            <div className="space-y-6">
                 <div>
                    <h2 className="text-xl font-semibold mb-4">Location Management</h2>
                    <LocationManager initialLocations={locations} />
                 </div>
            </div>
        </div>
    );
}
