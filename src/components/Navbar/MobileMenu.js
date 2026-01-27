"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { X, LogOut, User } from "lucide-react";
import EditProfileDialog from "@/components/EditProfileDialog";

export function MobileMenu({
  isOpen,
  onClose,
  links,
  pathname,
  session,
  onLogout,
  loggingOut,
  menuRef,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        ref={menuRef}
        className="fixed inset-y-0 left-0 w-3/4 max-w-sm bg-[#0f172a] shadow-2xl transition-transform duration-300 transform translate-x-0 border-r border-white/10"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-lg">
                {session?.user?.name?.[0] || "U"}
              </div>
              <div className="flex flex-col">
                <span className="text-white font-semibold truncate max-w-[150px]">
                  {session?.user?.name}
                </span>
                <span className="text-xs text-gray-500 uppercase tracking-wider">
                  {session?.user?.role?.replace("_", " ")}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Links */}
          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={clsx(
                  "flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-300",
                  pathname === link.href
                    ? "bg-linear-to-r from-violet-500/20 to-fuchsia-500/20 text-white border border-fuchsia-500/20"
                    : "text-gray-400 hover:bg-white/5 hover:text-white",
                )}
              >
                <div
                  className={clsx(
                    "p-2 rounded-lg",
                    pathname === link.href
                      ? "bg-linear-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/20"
                      : "bg-white/5 text-gray-400",
                  )}
                >
                  {link.icon}
                </div>
                <span className="font-medium">{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-white/5 space-y-3">
            <EditProfileDialog
              user={session?.user}
              session={session}
              trigger={
                <button className="flex items-center space-x-4 w-full px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group">
                  <div className="p-2 rounded-lg bg-white/5 group-hover:text-cyan-400 transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                  <span className="font-medium">Edit Profile</span>
                </button>
              }
            />

            <button
              onClick={onLogout}
              disabled={loggingOut}
              className="flex items-center space-x-4 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all group"
            >
              <div className="p-2 rounded-lg bg-red-500/10">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="font-medium">
                {loggingOut ? "Logging out..." : "Logout"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
