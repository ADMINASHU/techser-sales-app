import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function UserCard({ user, onClick, className = "", actions }) {
    if (!user) return null;

    const initials = user.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div
            className={`flex items-start gap-4 p-4 glass-card cursor-pointer group rounded-xl ${className}`}
            onClick={onClick}
        >
            {/* Left side: Image and Role */}
            <div className="flex flex-col items-center gap-2 min-w-[70px]">
                <Avatar className="h-14 w-14 ring-2 ring-white/10 shadow-xl group-hover:ring-violet-500/30 transition-all">
                    <AvatarImage src={user.image} alt={user.name} className="object-cover" />
                    <AvatarFallback className="bg-linear-to-br from-violet-600 to-indigo-700 text-white text-lg font-bold">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                <Badge
                    variant="outline"
                    className={`text-[10px] uppercase tracking-wider px-2 py-0 h-4 border-none shadow-sm ${user.role === "admin"
                            ? "bg-violet-500/20 text-violet-300"
                            : "bg-blue-500/20 text-blue-300"
                        }`}
                >
                    {user.role}
                </Badge>
            </div>

            {/* Right side: Name, Designation, Branch/Region */}
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-white truncate text-base group-hover:text-violet-300 transition-colors uppercase tracking-tight">{user.name}</h3>
                    {user.status && (
                        <Badge
                            variant="outline"
                            className={`text-[9px] h-4 px-1.5 border-none ${user.status === "verified"
                                    ? "bg-emerald-500/10 text-emerald-400"
                                    : user.status === "declined"
                                        ? "bg-red-500/10 text-red-400"
                                        : "bg-yellow-500/10 text-yellow-400"
                                }`}
                        >
                            {user.status}
                        </Badge>
                    )}
                </div>
                <p className="text-xs text-violet-400 font-semibold truncate uppercase tracking-wider min-h-4">
                    {user.designation || "\u00A0"}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-500 mt-2 font-medium">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-1 h-1 rounded-full bg-blue-500 shrink-0" />
                        <span className="truncate">{user.region || "No Region"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-1 h-1 rounded-full bg-indigo-500 shrink-0" />
                        <span className="truncate">{user.branch || "No Branch"}</span>
                    </div>
                </div>

                {actions && (
                    <div className="flex justify-end mt-2 pt-2 border-t border-white/5">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
}
