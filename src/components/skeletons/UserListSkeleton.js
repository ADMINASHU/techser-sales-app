
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function UserListSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="hidden sm:flex items-center justify-between">
                <Skeleton className="h-10 w-64" /> {/* Title */}
            </div>

            {/* Filters Skeleton */}
            <div className="glass-panel border-white/5 rounded-xl shadow-2xl">
                <div className="p-4">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Header Section */}
                        <div className="flex items-center justify-between lg:w-48 lg:border-r border-white/10 pr-6">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-9 w-9 rounded-lg" />
                                <Skeleton className="h-6 w-16" />
                            </div>
                            <Skeleton className="h-8 w-12" /> {/* Reset Button */}
                        </div>

                        {/* Filters Grid */}
                        <div className="flex-1 grid gap-4 grid-cols-2 md:grid-cols-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className={`space-y-1.5 ${i === 3 ? "col-span-2 md:col-span-1" : ""}`}>
                                    <Skeleton className="h-3 w-12 ml-1" />
                                    <Skeleton className="h-10 w-full rounded-md" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop Table Skeleton */}
            <div className="hidden md:block rounded-xl overflow-hidden glass-panel border border-white/5 shadow-2xl">
                <Table>
                    <TableHeader className="bg-white/5 border-b border-white/5">
                        <TableRow className="hover:bg-transparent border-white/5">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <TableHead key={i} className={`text-center ${i === 1 || i > 5 ? "" : "hidden lg:table-cell"}`}>
                                    <Skeleton className="h-4 w-20 mx-auto" />
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-white/5">
                        {[1, 2, 3, 4, 5].map((row) => (
                            <TableRow key={row} className="hover:bg-white/5 border-white/5">
                                <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-9 w-9 rounded-full" />
                                        <div className="space-y-1">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-3 w-40 md:hidden" />
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell className="hidden xl:table-cell"><Skeleton className="h-4 w-40" /></TableCell>
                                <TableCell className="hidden md:table-cell">
                                    <div className="space-y-1">
                                        <Skeleton className="h-3 w-20" />
                                        <Skeleton className="h-3 w-16" />
                                    </div>
                                </TableCell>
                                <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                                <TableCell className="text-right">
                                    <Skeleton className="h-8 w-8 ml-auto rounded-md" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Cards Skeleton */}
            <div className="md:hidden space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="glass-panel p-4 rounded-xl border border-white/5 space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-1">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-40" />
                                </div>
                            </div>
                            <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <Skeleton className="h-16 w-full rounded-lg" />
                            <Skeleton className="h-16 w-full rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
