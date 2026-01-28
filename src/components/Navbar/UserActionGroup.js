"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Settings as SettingsIcon, UserCog } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";

export function UserActionGroup({ session, onLogout, loggingOut, mounted }) {
  if (!session?.user) return null;

  return (
    <div className="hidden sm:flex items-center space-x-4">
      <NotificationBell />
      <div className="h-8 w-px bg-white/10 mx-2"></div>

      {mounted ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-10 w-10 rounded-full ring-2 ring-white/10 hover:ring-white/30 transition-all p-0 overflow-hidden"
            >
              <Avatar className="h-full w-full">
                {session.user.image && (
                  <AvatarImage
                    src={session.user.image}
                    alt={session.user.name}
                  />
                )}
                <AvatarFallback className="bg-linear-to-br from-violet-500 to-fuchsia-500 text-white font-bold">
                  {session.user.name
                    ? session.user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                    : "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-72 bg-slate-900 border border-white/10 shadow-lg mt-2 p-2"
            align="end"
            forceMount
          >
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg mb-2 border border-white/5">
              <Avatar className="h-10 w-10 border border-white/10">
                {session.user.image && <AvatarImage src={session.user.image} />}
                <AvatarFallback className="bg-linear-to-br from-violet-500 to-fuchsia-500 text-white text-xs font-bold">
                  {session.user.name
                    ? session.user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                    : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-white truncate">
                  {session.user.name}
                </span>
                <span className="text-xs text-gray-400 truncate">
                  {session.user.designation ||
                    session?.user?.role?.replace("_", " ")}
                </span>
              </div>
            </div>

            <DropdownMenuSeparator className="bg-white/5" />

            <Link href="/profile" className="block">
              <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-md cursor-pointer transition-all group">
                <div className="p-1.5 rounded-md bg-white/5 group-hover:bg-cyan-500/10 group-hover:text-cyan-400 transition-colors">
                  <User className="h-4 w-4" />
                </div>
                Profile
              </DropdownMenuItem>
            </Link>

            {(session.user.role === "admin" ||
              session.user.role === "super_user") && (
              <Link href="/settings" className="block">
                <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-md cursor-pointer transition-all group">
                  <div className="p-1.5 rounded-md bg-white/5 group-hover:bg-violet-500/10 group-hover:text-violet-400 transition-colors">
                    <SettingsIcon className="h-4 w-4" />
                  </div>
                  Settings
                </DropdownMenuItem>
              </Link>
            )}

            <DropdownMenuSeparator className="bg-white/5" />

            <DropdownMenuItem
              onClick={onLogout}
              disabled={loggingOut}
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md cursor-pointer transition-all group mt-1"
            >
              <div className="p-1.5 rounded-md bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
                <LogOut className="h-4 w-4" />
              </div>
              {loggingOut ? "Logging out..." : "Logout"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full ring-2 ring-white/10 p-0 overflow-hidden"
          disabled
        >
          <Avatar className="h-full w-full">
            {session.user.image && (
              <AvatarImage src={session.user.image} alt={session.user.name} />
            )}
            <AvatarFallback className="bg-linear-to-br from-violet-500 to-fuchsia-500 text-white font-bold">
              {session.user.name
                ? session.user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                : "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      )}
    </div>
  );
}
