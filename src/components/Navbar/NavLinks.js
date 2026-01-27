"use client";

import Link from "next/link";
import { clsx } from "clsx";

export function NavLinks({ links, pathname }) {
  return (
    <div className="hidden md:flex items-center justify-center">
      <div className="bg-white/5 border border-white/5 rounded-full px-1.5 py-1.5 flex space-x-1 shadow-inner backdrop-blur-md">
        {links
          .filter((link) => link.href !== "/settings")
          .map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "relative px-6 py-2 rounded-full text-sm font-medium transition-all duration-300",
                pathname === link.href
                  ? "text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5",
              )}
            >
              {pathname === link.href && (
                <div className="absolute inset-x-0 bottom-0 top-0 bg-linear-to-r from-violet-500/80 to-fuchsia-500/80 rounded-full shadow-lg shadow-fuchsia-500/20 -z-10" />
              )}
              {link.label}
            </Link>
          ))}
      </div>
    </div>
  );
}
