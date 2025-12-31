import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function EntriesSkeleton({ view = "grid" }) {
    if (view === "list") {
        return (
            <div className="rounded-xl overflow-hidden glass-panel border border-white/5 shadow-2xl">
                <Table>
                    <TableHeader className="bg-white/5 border-b border-white/5">
                        <TableRow className="hover:bg-transparent border-white/5">
                            <TableHead className="w-12 text-center text-xs text-gray-400 font-semibold uppercase">#</TableHead>
                            <TableHead className="text-xs text-gray-400 font-semibold uppercase">Date</TableHead>
                            <TableHead className="text-xs text-gray-400 font-semibold uppercase">Timings</TableHead>
                            <TableHead className="text-xs text-gray-400 font-semibold uppercase">Status</TableHead>
                            <TableHead className="text-xs text-gray-400 font-semibold uppercase">Customer</TableHead>
                            <TableHead className="text-right text-xs text-gray-400 font-semibold uppercase">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(8)].map((_, i) => (
                            <TableRow key={i} className="hover:bg-white/5 border-white/5 h-[100px]">
                                <TableCell><Skeleton className="h-4 w-6 mx-auto" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell><div className="space-y-1"><Skeleton className="h-3 w-20" /><Skeleton className="h-3 w-24" /></div></TableCell>
                                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                <TableCell><div className="space-y-1"><Skeleton className="h-4 w-48" /><Skeleton className="h-3 w-64" /></div></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="glass-card p-4 rounded-xl h-[230px] flex flex-col space-y-4">
                        <div className="flex justify-between items-start">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-5 w-16" />
                        </div>
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                        <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-6 w-20" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
