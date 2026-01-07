import { Suspense } from "react";
import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton";

export default function DashboardLayout({ children }) {
    return (
        <Suspense fallback={<DashboardSkeleton />}>
            {children}
        </Suspense>
    );
}
