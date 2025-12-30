"use client";

import { useSession } from "next-auth/react";
import { updateProfile } from "@/app/actions/userActions";
import { getLocations } from "@/app/actions/settingsActions";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import AvatarUploader from "@/components/AvatarUploader";

import { MapPin, Bell, ArrowRight, CheckCircle2 } from "lucide-react";

export default function ProfileSetupPage() {
    const { data: session, update } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(0); // 0: Welcome/Permissions, 1: Profile Form

    const [locations, setLocations] = useState([]);
    const [contactNumber, setContactNumber] = useState("");
    const [address, setAddress] = useState("");
    const [region, setRegion] = useState("");
    const [branch, setBranch] = useState("");

    const [permissions, setPermissions] = useState({
        location: false,
        notifications: false
    });

    useEffect(() => {
        getLocations().then(data => setLocations(data));

        // Check if permissions were already granted
        if ("Notification" in window && Notification.permission === "granted") {
            // eslint-disable-next-line
            setPermissions(prev => ({ ...prev, notifications: true }));
        }

        if ("geolocation" in navigator) {
            navigator.permissions?.query({ name: 'geolocation' }).then(result => {
                if (result.state === 'granted') {
                    setPermissions(prev => ({ ...prev, location: true }));
                }
            });
        }
    }, []);

    const requestLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                () => {
                    setPermissions(prev => ({ ...prev, location: true }));
                    toast.success("Location access granted!");
                },
                (error) => {
                    console.error("Location error:", error);
                    toast.error("Could not get location access.");
                }
            );
        }
    };

    const requestNotifications = async () => {
        if ("Notification" in window) {
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
                setPermissions(prev => ({ ...prev, notifications: true }));
                toast.success("Notification access granted!");
            } else {
                toast.error("Notification access denied.");
            }
        }
    };

    // Derived state for branches
    const availableBranches = locations.find(l => l.name === region)?.branches.sort() || [];

    // Handle region change to reset branch
    const handleRegionChange = (newRegion) => {
        setRegion(newRegion);
        setBranch("");
    };

    async function handleSubmit(e) {
        e.preventDefault();
        if (loading) return;
        setLoading(true);

        const formData = new FormData();
        formData.append("contactNumber", contactNumber);
        formData.append("address", address);
        formData.append("region", region);
        formData.append("branch", branch);

        const res = await updateProfile(formData);
        setLoading(false);

        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success("Profile updated!");
            router.push("/dashboard");
            router.refresh();
        }
    }

    if (step === 0) {
        return (
            <div className="flex justify-center items-center py-2 px-4">
                <Card className="w-full max-w-xl bg-[#0A0A0B] border-white/10 shadow-2xl overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1" />
                    <CardHeader className="pt-5 pb-5 text-center">
                        <div className="mx-auto w-60 h-20 flex items-center justify-center mb-2 p-1">
                            <Image
                                src="/logo.png"
                                alt="App Logo"
                                width={120}
                                height={120}
                                className="object-contain"
                                priority
                                unoptimized
                            />
                        </div>
                        <CardTitle className="text-3xl font-bold text-white mb-2">
                            Welcome !
                        </CardTitle>
                        <CardDescription className="text-gray-400 text-base max-w-sm mx-auto">
                            We&apos;re excited to have you! Let&apos;s get your workspace ready with the necessary permissions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8 px-8 pb-10">
                        <div className="grid gap-4">
                            {/* Location Permission */}
                            <div className={`p-4 rounded-xl border transition-all duration-300 ${permissions.location ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/5 border-white/5'}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2.5 rounded-lg ${permissions.location ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white text-sm">Location Access</h4>
                                            <p className="text-xs text-gray-500 mt-0.5">Required for accurate visit stamping</p>
                                        </div>
                                    </div>
                                    {permissions.location ? (
                                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={requestLocation}
                                            className="h-8 text-xs bg-white/5 hover:bg-white/10 border-white/10 text-gray-300"
                                        >
                                            Allow
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Notifications Permission */}
                            <div className={`p-4 rounded-xl border transition-all duration-300 ${permissions.notifications ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/5 border-white/5'}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2.5 rounded-lg ${permissions.notifications ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/10 text-orange-400'}`}>
                                            <Bell className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white text-sm">Notifications</h4>
                                            <p className="text-xs text-gray-500 mt-0.5">Stay updated on visit approvals and tasks</p>
                                        </div>
                                    </div>
                                    {permissions.notifications ? (
                                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={requestNotifications}
                                            className="h-8 text-xs bg-white/5 hover:bg-white/10 border-white/10 text-gray-300"
                                        >
                                            Allow
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Button
                            className="w-full h-12 bg-linear-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 border-0 group disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale-[0.5]"
                            onClick={() => setStep(1)}
                            disabled={!permissions.location || !permissions.notifications}
                        >
                            {!permissions.location || !permissions.notifications ? "Please Allow Permissions to Continue" : "Start Profile Setup"}
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center py-12 px-4">
            <Card className="w-full max-w-lg bg-[#0A0A0B] border-white/10 shadow-2xl">
                <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setStep(0)}
                            className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/5"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                        </Button>
                        <CardTitle className="text-2xl font-bold text-white">Complete Your Profile</CardTitle>
                    </div>
                    <CardDescription className="text-gray-400 ml-11">
                        Please provide additional details to finish setting up your account.
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-8 flex flex-col items-center">
                    <div className="mb-8">
                        <AvatarUploader user={session?.user || {}} className="h-24 w-24 ring-4 ring-white/10" />
                        <p className="text-xs text-gray-500 text-center mt-2 font-medium">Click to upload</p>
                    </div>

                    <form onSubmit={handleSubmit} className="w-full">
                        <div className="grid w-full items-center gap-6">
                            <div className="flex flex-col space-y-2">
                                <Label htmlFor="contactNumber" className="text-gray-300 text-sm font-medium ml-1">Contact Number (10 Digits)</Label>
                                <Input
                                    id="contactNumber"
                                    name="contactNumber"
                                    placeholder="e.g. 9876543210"
                                    required
                                    value={contactNumber}
                                    onChange={(e) => setContactNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                    type="tel"
                                    pattern="[0-9]{10}"
                                    className="h-11 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:ring-blue-500/50"
                                />
                            </div>
                            <div className="flex flex-col space-y-2">
                                <Label htmlFor="address" className="text-gray-300 text-sm font-medium ml-1">Full Address</Label>
                                <Textarea
                                    id="address"
                                    name="address"
                                    placeholder="Enter your house no, street, city..."
                                    required
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="min-h-[100px] bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:ring-blue-500/50 pt-3"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col space-y-2">
                                    <Label htmlFor="region" className="text-gray-300 text-sm font-medium ml-1">Region</Label>
                                    <Select value={region} onValueChange={handleRegionChange} required>
                                        <SelectTrigger className="h-11 bg-white/5 border-white/10 text-white focus:ring-blue-500/50">
                                            <SelectValue placeholder="Select Region" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1a1f2e] border-white/10 text-white">
                                            {locations.map((loc) => (
                                                <SelectItem key={loc._id} value={loc.name}>
                                                    {loc.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex flex-col space-y-2">
                                    <Label htmlFor="branch" className="text-gray-300 text-sm font-medium ml-1">Branch</Label>
                                    <Select value={branch} onValueChange={setBranch} disabled={!region} required>
                                        <SelectTrigger className="h-11 bg-white/5 border-white/10 text-white focus:ring-blue-500/50 disabled:opacity-40">
                                            <SelectValue placeholder="Select Branch" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1a1f2e] border-white/10 text-white">
                                            {availableBranches.map((b) => (
                                                <SelectItem key={b} value={b}>
                                                    {b}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <LoadingButton
                                type="submit"
                                loading={loading}
                                className="w-full h-12 mt-4 bg-linear-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-semibold rounded-xl border-0 shadow-lg shadow-blue-500/20 transition-all duration-300 active:scale-[0.98]"
                            >
                                Save & Continue
                            </LoadingButton>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

