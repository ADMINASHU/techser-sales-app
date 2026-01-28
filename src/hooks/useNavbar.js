"use client";

import {
  useState,
  useEffect,
  useRef,
  useSyncExternalStore,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { unsubscribeFromPushNotifications } from "@/lib/firebase";
import { getNavLinks } from "@/config/navConfig";

export function useNavbar(session) {
  const [isOpen, setIsOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const router = useRouter();

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        (!buttonRef.current || !buttonRef.current.contains(event.target))
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Removed router.refresh() on enableStamping change to prevent race conditions with session updates

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await unsubscribeFromPushNotifications();
    } catch (error) {
      console.error("Error cleaning up FCM:", error);
    } finally {
      signOut();
    }
  };

  const links = useMemo(() => getNavLinks(session), [session]);

  return {
    isOpen,
    setIsOpen,
    loggingOut,
    handleLogout,
    menuRef,
    buttonRef,
    mounted,
    links,
  };
}
