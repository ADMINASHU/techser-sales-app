"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Clock, ShieldAlert, XCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import RefreshStatusButton from "@/components/RefreshStatusButton";

export default function VerificationPendingPage() {
    const { data: session, status } = useSession();
    const searchParams = useSearchParams();
    const router = useRouter();
    const reason = searchParams.get('reason');

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated" && (session?.user?.status === "verified" || session?.user?.role === "admin")) {
            router.push("/dashboard");
        }
    }, [status, session, router]);

    if (status === "loading") {
        return null;
    }

    return (
        <div className="flex flex-col items-center justify-center py-5 px-4 min-h-[70vh]">
            <Card className="w-full max-w-lg bg-[#0A0A0B] border-white/10 shadow-2xl text-center overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 " />
                <CardHeader className="pt-5 pb-6">
                    <div className={`mx-auto w-20 h-20 ${reason ? 'bg-red-500/10' : 'bg-yellow-500/10'} rounded-full flex items-center justify-center mb-6 ring-4 ${reason ? 'ring-red-500/5' : 'ring-yellow-500/5'} ${!reason && 'animate-pulse'}`}>
                        {reason ? (
                            <XCircle className="h-10 w-10 text-red-500" />
                        ) : (
                            <Clock className="h-10 w-10 text-yellow-500" />
                        )}
                    </div>
                    <CardTitle className="text-3xl font-bold text-white mb-2 tracking-tight">
                        {reason === 'declined' && 'Account Declined'}
                        {reason === 'deleted' && 'Account Removed'}
                        {!reason && 'Account Verification Pending'}
                    </CardTitle>
                    <CardDescription className="text-gray-400 text-lg">
                        {reason ? 'Action required by administrator' : "We're reviewing your credentials"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-10 pb-10 space-y-6">
                    {reason === 'declined' && (
                        <Alert variant="destructive" className="bg-red-500/5 border-red-500/20">
                            <AlertTitle className="text-red-400">Account Declined</AlertTitle>
                            <AlertDescription className="text-red-300/80">
                                Your account verification was declined by an administrator. Please contact support for more information.
                            </AlertDescription>
                        </Alert>
                    )}

                    {reason === 'deleted' && (
                        <Alert variant="destructive" className="bg-red-500/5 border-red-500/20">
                            <AlertTitle className="text-red-400">Account Removed</AlertTitle>
                            <AlertDescription className="text-red-300/80">
                                Your account has been removed by an administrator. Please contact support if you believe this was done in error.
                            </AlertDescription>
                        </Alert>
                    )}

                    {!reason && (
                        <>
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                                <p className="text-gray-300 text-base leading-relaxed">
                                    Thank you for completing your profile. Your account is currently under review by the administrator to ensure security and data integrity.
                                </p>
                                <div className="flex items-start gap-3 text-left bg-blue-500/5 p-4 rounded-xl border border-blue-500/10">
                                    <ShieldAlert className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                                    <p className="text-sm text-blue-300/80 italic">
                                        Access to the dashboard and entry logging is restricted until your account status is updated to verified.
                                    </p>
                                </div>
                            </div>

                            <p className="text-sm text-gray-500">
                                You will receive a notification once the approval process is complete.
                            </p>

                            <div className="flex flex-col items-center gap-3 pt-1">
                                <RefreshStatusButton />
                                <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">
                                    Click above to check latest status
                                </p>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
