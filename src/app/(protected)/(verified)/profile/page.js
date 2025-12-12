import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

import EditProfileDialog from "@/components/EditProfileDialog"; // [NEW]
import AvatarUploader from "@/components/AvatarUploader"; // [NEW]

export default async function ProfilePage() {
    const session = await auth();
    await dbConnect();
    const user = await User.findById(session.user.id);

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
        role: user.role,
        status: user.status,
        image: user.image,
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Account Settings</h1>
                <p className="text-gray-400">Manage your profile, preferences, and security settings.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">

                {/* Left Column: Profile Card */}
                <Card className="md:col-span-1 bg-[#1a1f2e] border-white/5 shadow-xl h-fit">
                    <CardContent className="pt-8 flex flex-col items-center text-center space-y-4">
                        <div className="relative">
                            <div className="h-32 w-32 rounded-full ring-4 ring-white/5 overflow-hidden">
                                <AvatarUploader user={userPlain} className="h-full w-full" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                            <p className="text-gray-400">{user.email}</p>
                        </div>
                        <div className="flex gap-2 pt-2">
                            <div className="px-3 py-1 bg-white/5 rounded-full text-xs font-medium text-gray-300 border border-white/5 flex items-center gap-2">
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>
                                {user.role === 'admin' ? 'Administrator' : 'Sales Representative'}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Right Column: General Information */}
                <Card className="md:col-span-2 bg-[#1a1f2e] border-white/5 shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                            <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            General Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Display Name</label>
                                <div className="h-11 px-3 py-2 rounded-md bg-[#1e293b]/50 border border-white/10 text-white flex items-center">
                                    {user.name}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Email Address</label>
                                <div className="h-11 px-3 py-2 rounded-md bg-[#1e293b]/50 border border-white/10 text-white flex items-center">
                                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    {user.email}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Assigned Branch & Region</label>
                            <div className="h-14 px-4 rounded-lg bg-[#1e293b]/50 border border-white/10 text-white flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-cyan-500/20 p-2 rounded-md">
                                        <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                    </div>
                                    <div>
                                        <div className="font-medium">{user.branch || "No Branch"}</div>
                                        <div className="text-xs text-gray-400">{user.region || "No Region"}</div>
                                    </div>
                                </div>
                                <UpdateDetailsTrigger user={userPlain} />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">These details are managed by your administrator.</p>
                        </div>

                        <div className="flex justify-end pt-4">
                            <EditProfileDialog user={userPlain} trigger={
                                <Button className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white shadow-lg shadow-fuchsia-500/20 border-0">
                                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    Edit Profile
                                </Button>
                            } />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// Helper to avoid hydration mismatch if needed, but mainly to keep JSX clean
function UpdateDetailsTrigger({ user }) {
    return null; // Admin controlled mostly
}
