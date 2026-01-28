import {
  LayoutDashboard,
  ClipboardList,
  MapPin,
  Users,
  UserCog,
  BarChart3,
  Settings,
} from "lucide-react";

export const getNavLinks = (session) => {
  if (!session?.user) return [];

  const isCoreAdmin =
    session.user.role === "admin" || session.user.role === "super_user";

  const baseLinks = isCoreAdmin
    ? [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: <LayoutDashboard className="w-5 h-5" />,
      },
      {
        href: "/entries",
        label: "Entry Log",
        icon: <ClipboardList className="w-5 h-5" />,
      },
    ]
    : [
      {
        href: "/customer-log",
        label: "Stamp In/Out",
        icon: <MapPin className="w-5 h-5" />,
      },
      {
        href: "/entries",
        label: "Entry Log",
        icon: <ClipboardList className="w-5 h-5" />,
      },
      {
        href: "/customers",
        label: "Customers",
        icon: <Users className="w-5 h-5" />,
      },
      {
        href: "/report",
        label: "Report",
        icon: <BarChart3 className="w-5 h-5" />,
      },
    ];

  if (session.user.role === "super_user") {
    const showStamping = !!session.user.enableStamping;

    if (showStamping) {
      baseLinks.unshift({
        href: "/customer-log",
        label: "Stamp In/Out",
        icon: <MapPin className="w-5 h-5" />,
      });
      baseLinks.push({
        href: "/customers",
        label: "Customers",
        icon: <Users className="w-5 h-5" />,
      });
    }
  }

  const isAdminOrSuper =
    session.user.role === "admin" || session.user.role === "super_user";

  if (isAdminOrSuper) {
    const isSuperUser = session.user.role === "super_user";
    const showStamping = !!session.user.enableStamping;
    baseLinks.push({
      href: "/users",
      label: "Users",
      icon: <UserCog className="w-5 h-5" />,
    });

    baseLinks.push({
      href: "/report",
      label: "Report",
      icon: <BarChart3 className="w-5 h-5" />,
    });
    baseLinks.push({
      href: "/settings",
      label: "Settings",
      icon: <Settings className="w-5 h-5" />,
    });
  }

  return baseLinks;
};
