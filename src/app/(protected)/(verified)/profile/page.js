import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Entry from "@/models/Entry";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

import EditProfileDialog from "@/components/EditProfileDialog"; // [NEW]
import AvatarUploader from "@/components/AvatarUploader"; // [NEW]

import {
  Mail,
  Phone,
  MapPin,
  Building2,
  Globe,
  ShieldCheck,
  Activity,
} from "lucide-react"; // [NEW]

export default async function ProfilePage() {
  const session = await auth();
  await dbConnect();

  // Fetch User and Stats in parallel
  const [user, totalEntries, lastEntry] = await Promise.all([
    User.findById(session.user.id),
    Entry.countDocuments({ userId: session.user.id }),
    Entry.findOne({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .select("createdAt"),
  ]);

  if (!user) {
    return <div>User not found</div>;
  }

  // Convert Mongoose doc to plain object for Client Component
  const userPlain = {
    name: user.name,
    email: user.email,
    contactNumber: user.contactNumber,
    address: user.address,
    region: user.region,
    branch: user.branch,
    designation: user.designation,
    role: user.role,
    status: user.status,
    image: user.image,
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Header Card */}
      <div className="relative overflow-hidden rounded-2xl glass-card p-5 md:p-8">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 blur-3xl rounded-full -ml-16 -mb-16 pointer-events-none" />

        <div className="relative z-10 flex flex-row items-center gap-4 md:gap-8">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="h-20 w-20 md:h-32 md:w-32 rounded-full ring-4 ring-white/10 shadow-2xl overflow-hidden">
              <AvatarUploader
                user={userPlain}
                className="h-full w-full object-cover"
              />
            </div>
            <div
              className={`absolute bottom-2 right-2 h-3.5 w-3.5 md:h-5 md:w-5 rounded-full border-4 border-[#030712] ${user.status === "verified" ? "bg-emerald-500" : "bg-yellow-500"}`}
              title={user.status}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-2 md:space-y-3">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight truncate">
                {user.name}
              </h1>
              <p className="text-sm md:text-base text-gray-400 font-medium flex items-center gap-2 mt-0.5">
                <span className="bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5 truncate">
                  {user.designation || "Team Member"}
                </span>
              </p>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
              {user.region && (
                <div className="flex items-center text-xs font-medium text-gray-300 bg-white/5 px-3 py-0.5 rounded-full border border-white/10 w-fit max-w-full">
                  <svg
                    className="w-3 h-3 mr-1.5 text-cyan-400 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="truncate">
                    {user.branch}, {user.region}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action */}
          <div className="shrink-0 absolute top-0 right-0 md:static md:top-auto md:right-auto">
            <EditProfileDialog
              user={userPlain}
              session={session}
              trigger={
                <Button
                  className="glass-btn-primary h-9 w-9 p-0 md:h-10 md:w-auto md:px-6 rounded-full md:rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  title="Edit Profile"
                >
                  <svg
                    className="w-4 h-4 md:mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                  <span className="hidden md:inline text-sm font-medium">
                    Edit Profile
                  </span>
                </Button>
              }
            />
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Contact Info */}
        <div className="glass-panel p-6 md:p-8 rounded-2xl md:rounded-3xl space-y-6 md:space-y-8 h-full bg-linear-to-b from-white/5 to-transparent">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <span className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </span>
            Contact Information
          </h3>
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="group">
                <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  Email Address
                </label>
                <div
                  className="text-lg text-gray-200 group-hover:text-white transition-colors truncate"
                  title={user.email}
                >
                  {user.email}
                </div>
              </div>
              <div className="group">
                <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-blue-400" />
                  Phone Number
                </label>
                <div className="text-lg text-gray-200 group-hover:text-white transition-colors">
                  {user.contactNumber || "Not Provided"}
                </div>
              </div>
            </div>
            <div className="group">
              <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                Physical Address
              </label>
              <div className="text-lg text-gray-200 group-hover:text-white transition-colors leading-relaxed">
                {user.address || "Not Provided"}
              </div>
            </div>
          </div>
        </div>

        {/* Work Info */}
        <div className="glass-panel p-6 md:p-8 rounded-2xl md:rounded-3xl space-y-6 md:space-y-8 h-full bg-linear-to-b from-white/5 to-transparent">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <span className="p-2 bg-fuchsia-500/20 rounded-lg text-fuchsia-400">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </span>
            Work Details
          </h3>
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="group">
                <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2 flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-fuchsia-400" />
                  Assigned Branch
                </label>
                <div className="text-lg text-white font-medium">
                  {user.branch || "N/A"}
                </div>
              </div>
              <div className="group">
                <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2 flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-fuchsia-400" />
                  Region
                </label>
                <div className="text-lg text-white font-medium">
                  {user.region || "N/A"}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2 flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-fuchsia-400" />
                    Account Type
                  </label>
                  <Badge
                    variant="outline"
                    className={`uppercase tracking-wider px-2 py-0.5 w-fit text-[10px] md:text-xs ${user.role === "admin" ? "bg-violet-500/20 text-violet-300 border-violet-500/30" : "bg-blue-500/20 text-blue-300 border-blue-500/30"}`}
                  >
                    {user.role === "admin" ? "Administrator" : "User Account"}
                  </Badge>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2 flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-fuchsia-400" />
                    Account Status
                  </label>
                  <div
                    className={`text-sm font-bold uppercase tracking-wide ${user.status === "verified" ? "text-emerald-400" : "text-yellow-400"}`}
                  >
                    {user.status}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper to avoid hydration mismatch if needed, but mainly to keep JSX clean
function UpdateDetailsTrigger({ user }) {
  return null; // Admin controlled mostly
}
