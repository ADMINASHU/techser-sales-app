import { auth } from "@/auth";
import { getLocations } from "@/app/actions/settingsActions";
import LocationManager from "@/components/LocationManager";
import StampingToggle from "@/components/StampingToggle";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const isAdmin = session.user.role === "admin";
  const isSuperUser = session.user.role === "super_user";

  if (!isAdmin && !isSuperUser) {
    redirect("/login"); // Or appropriate fallback
  }

  const locations = isAdmin ? await getLocations() : [];

  return (
    <div className="space-y-6">
      <div className="hidden sm:flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Settings
        </h1>
      </div>

      <div className="space-y-8 pb-20">
        {isSuperUser && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white/90">
              User Preferences
            </h2>
            <StampingToggle initialEnabled={session.user.enableStamping} />
          </section>
        )}

        {isAdmin && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white/90">
              Location Management
            </h2>
            <LocationManager initialLocations={locations} />
          </section>
        )}
      </div>
    </div>
  );
}
