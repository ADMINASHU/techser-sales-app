import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, MapPin, Phone, Shield, Briefcase, Activity, Check, X, Loader2 } from "lucide-react";
import { verifyUser, declineUser, updateUserRole } from "@/app/actions/adminActions";
import { toast } from "sonner";

export default function UserProfileModal({ user, open, onOpenChange, showActions = true }) {
    const [isLoading, setIsLoading] = useState(false);

    if (!user) return null;

    const handleAction = async (actionFn, ...args) => {
        setIsLoading(true);
        try {
            // Pass args to the server action
            const result = await actionFn(...args);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Action successful");
                onOpenChange(false);
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const DetailItem = ({ label, value, icon: Icon, fullWidth = false }) => (
        <div className={`${fullWidth ? "col-span-2" : "col-span-1"} space-y-1.5`}>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {label}
            </div>
            <div className="text-sm font-medium text-gray-200 break-words pl-5.5">
                {value}
            </div>
        </div>
    );

    const initials = user.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#0A0A0B] border-white/10 text-white sm:max-w-2xl p-0 overflow-hidden gap-0">
                <div className="flex flex-col md:flex-row h-full">

                    {/* Left Sidebar: ID Card style */}
                    <div className="w-full md:w-1/3 bg-white/[0.02] border-b md:border-b-0 md:border-r border-white/10 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                        {/* Background Accent */}
                        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-violet-500/10 to-transparent pointer-events-none" />

                        <Avatar className="h-32 w-32 ring-4 ring-white/5 shadow-2xl mb-6 relative z-10">
                            <AvatarImage src={user.image} alt={user.name} className="object-cover" />
                            <AvatarFallback className="bg-violet-500 text-white text-3xl font-bold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>

                        <div className="relative z-10 space-y-2">
                            <h3 className="text-lg font-bold text-white leading-tight">{user.name}</h3>
                            {user.designation && (
                                <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium">
                                    {user.designation}
                                </div>
                            )}
                            {showActions && (
                                <div className="pt-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5"
                                        onClick={() => handleAction(updateUserRole, user._id, user.role === "admin" ? "user" : "admin")}
                                        disabled={isLoading}
                                    >
                                        Make {user.role === "admin" ? "User" : "Admin"}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Content: Details */}
                    <div className="w-full md:w-2/3 flex flex-col">
                        <div className="p-6 pb-2 border-b border-white/5">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                    User Details
                                </DialogTitle>
                            </DialogHeader>
                        </div>

                        <div className="p-6 flex-1 overflow-y-auto">
                            <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                                <DetailItem label="Email Address" value={user.email} icon={Mail} />

                                <div className="col-span-1 space-y-1.5">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        <Shield className="w-3.5 h-3.5" /> Account Type
                                    </div>
                                    <div className="pl-5.5">
                                        <Badge 
                                            variant="outline"
                                            className={`uppercase tracking-wider text-[10px] px-2 py-0.5 border shadow-sm ${
                                                user.role === "admin" 
                                                ? "bg-violet-500/20 text-violet-300 border-violet-500/30" 
                                                : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                                            }`}
                                        >
                                            {user.role}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="col-span-1 space-y-1.5">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        <Activity className="w-3.5 h-3.5" /> Status
                                    </div>
                                    <div className="pl-5.5">
                                        <Badge
                                            variant="outline"
                                            className={`uppercase tracking-wider text-[10px] px-2 py-0.5 border shadow-sm ${
                                                user.status === "verified"
                                                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                                    : user.status === "declined"
                                                        ? "bg-red-500/20 text-red-400 border-red-500/30"
                                                        : "bg-yellow-400/20 text-yellow-400 border-yellow-400/30"
                                            }`}
                                        >
                                            {user.status || "Pending"}
                                        </Badge>
                                    </div>
                                </div>

                                <DetailItem label="Phone Number" value={user.contactNumber || "N/A"} icon={Phone} />

                                <DetailItem label="Region" value={user.region || "N/A"} icon={MapPin} />
                                <DetailItem label="Branch" value={user.branch || "N/A"} icon={MapPin} />

                                <div className="col-span-2 space-y-1.5 border-t border-white/10 pt-4">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        <MapPin className="w-3.5 h-3.5" /> Address
                                    </div>
                                    <div className="text-sm text-gray-300 leading-normal pl-5.5">
                                        {user.address || "No address provided."}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons Footer */}
                        {showActions && (
                            <div className="p-6 pt-2 mt-auto border-t border-white/5 flex gap-3 justify-end">
                                {(user.status === "pending" || user.status === "declined") && (
                                    <Button
                                        onClick={() => handleAction(verifyUser, user._id)}
                                        disabled={isLoading}
                                        className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                                    >
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                                        Verify User
                                    </Button>
                                )}

                                {(user.status === "pending" || user.status === "verified") && (
                                    <Button
                                        onClick={() => handleAction(declineUser, user._id)}
                                        disabled={isLoading}
                                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                                    >
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <X className="w-4 h-4 mr-2" />}
                                        Decline User
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    );
}
