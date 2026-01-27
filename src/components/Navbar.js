"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Menu } from "lucide-react";
import Image from "next/image";
import { useNavbar } from "@/hooks/useNavbar";
import { NavLinks } from "./Navbar/NavLinks";
import { MobileMenu } from "./Navbar/MobileMenu";
import { UserActionGroup } from "./Navbar/UserActionGroup";
import NotificationBell from "@/components/NotificationBell";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const {
    isOpen,
    setIsOpen,
    loggingOut,
    handleLogout,
    menuRef,
    buttonRef,
    links,
    mounted,
  } = useNavbar(session);

  return (
    <>
      <nav className="sticky top-0 z-40 w-full glass-panel border-b border-white/5 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo */}
            <Link
              href={
                session?.user?.role === "admin" ||
                  session?.user?.role === "super_user"
                  ? session.user.role === "super_user" &&
                    !!session.user.enableStamping
                    ? "/customer-log"
                    : "/dashboard"
                  : "/customer-log"
              }
              className="shrink-0 flex items-center group"
            >
              <div className="mr-3 transition-transform group-hover:scale-105">
                <Image
                  src="/logo.png"
                  alt="Techser Logo"
                  width={160}
                  height={40}
                  className="h-8 w-auto sm:h-10 object-contain"
                  style={{ width: "auto" }}
                  priority
                />
              </div>
            </Link>

            {/* Mobile Page Title */}
            <div className="sm:hidden absolute left-1/2 -translate-x-1/2 flex items-center h-16 pointer-events-none">
              <span className="text-lg font-bold bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent truncate max-w-[150px]">
                {links.find((l) => l.href === pathname)?.label ||
                  (pathname === "/profile"
                    ? "Profile"
                    : pathname === "/settings"
                      ? "Settings"
                      : pathname.startsWith("/entries/")
                        ? "Visit Details"
                        : "")}
              </span>
            </div>

            {/* Desktop Navigation Links */}
            <NavLinks links={links} pathname={pathname} />

            {/* Desktop Right Actions */}
            <UserActionGroup
              session={session}
              onLogout={handleLogout}
              loggingOut={loggingOut}
              mounted={mounted}
            />

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center gap-4">
              <NotificationBell />
              <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all border border-white/5"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Navigation */}
      <MobileMenu
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        links={links}
        pathname={pathname}
        session={session}
        onLogout={handleLogout}
        loggingOut={loggingOut}
        menuRef={menuRef}
      />

      {/* Logout Loading Overlay */}
      {loggingOut && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-9999 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-white/10 border-t-white rounded-full animate-spin"></div>
            </div>
            <p className="text-white font-medium text-lg">Logging out...</p>
            <p className="text-gray-400 text-sm">Please wait</p>
          </div>
        </div>
      )}
    </>
  );
}
