import { auth } from "@/auth";
import { getLocations } from "@/app/actions/settingsActions";
import LocationManager from "@/components/LocationManager";
import SyncButton from "@/components/SyncButton";
import { redirect } from "next/navigation";
import ViewPreferenceToggle from "@/components/ViewPreferenceToggle";

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
    const session = await auth();
    if (!session) redirect("/login");

    const isAdmin = session.user.role === "admin";

    if (!isAdmin) {
        return (
            <div className="space-y-6">
                <div className="hidden sm:flex items-center justify-between">
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
            <div className="hidden sm:flex items-center justify-between">
                <h1 className="text-3xl font-bold bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">Settings</h1>
            </div>

            <div className="space-y-6 pb-20">
                <div>
                    <h2 className="text-xl font-semibold mb-4">Location Management</h2>
                    <LocationManager initialLocations={locations} />
                </div>

                <div className="pt-6 border-t border-white/10">
                    <h2 className="text-xl font-semibold mb-4">App Preferences</h2>
                    <div className="glass-panel p-6 rounded-xl flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-medium text-white">Default View</h3>
                            <p className="text-sm text-gray-400">Choose how you want to see lists by default.</p>
                        </div>
                        <ViewPreferenceToggle />
                    </div>
                </div>

                <SyncButton sheetId={process.env.GOOGLE_SHEET_ID} />
            </div>
        </div>
    );
}
