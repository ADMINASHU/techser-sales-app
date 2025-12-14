"use client";

import { useKnockClient } from "@knocklabs/react";
import Knock from "@knocklabs/client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { messaging, getToken } from "@/lib/firebase";

export default function PushDebug() {
    const knockHook = useKnockClient();
    const { data: session } = useSession();
    const [status, setStatus] = useState("idle");

    // Initialize state with env var, but allow editing
    const [channelId, setChannelId] = useState("");
    const apiKey = process.env.NEXT_PUBLIC_KNOCK_PUBLIC_API_KEY;
    const [vapidKey, setVapidKey] = useState("");

    // Effect to load env var on mount
    useEffect(() => {
        if (process.env.NEXT_PUBLIC_KNOCK_PUSH_CHANNEL_ID) {
            setChannelId(process.env.NEXT_PUBLIC_KNOCK_PUSH_CHANNEL_ID);
        }
    }, []);

    const handleManualRegister = async () => {
        setStatus("manual-loading");

        try {
            if (!session?.user?.id) throw new Error("No user ID");

            console.log("PushDebug: Registering SW...");
            const registration = await navigator.serviceWorker.register("/service-worker.js");

            // 2. Get FCM Token (Direct Firebase SDK)
            console.log("PushDebug: Getting FCM Token...");

            const options = { serviceWorkerRegistration: registration };
            if (vapidKey) options.vapidKey = vapidKey;

            const fcmToken = await getToken(messaging, options);

            if (!fcmToken) throw new Error("No FCM Token received from Firebase.");
            console.log("PushDebug: Got FCM Token:", fcmToken);

            // 3. Save Token to Server (Direct FCM)
            console.log("PushDebug: Saving Token to DB...");

            const response = await fetch("/api/user/save-fcm-token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: fcmToken }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || "Failed to save token to DB");
            }

            console.log("PushDebug: Token Saved to DB Successfully");
            toast.success("FCM Token Saved to Server!");
            setStatus("success");

        } catch (e) {
            console.error("PushDebug: Manual error:", e);
            toast.error("Manual Reg Failed: " + e.message);
            setStatus("error");
        }
    };

    const handleRegister = async () => {
        try {
            if (!knockHook.push) {
                toast.error("Hook client missing push. Use Manual Button below.");
                return;
            }
            await knockHook.push.register(channelId);
            toast.success("Hook Registration Success");
        } catch (e) {
            console.error(e);
            toast.error("Hook Failed: " + e.message);
        }
    };

    return (
        <div className="p-4 bg-white/5 rounded-lg border border-white/10 my-4">
            <h3 className="text-sm font-semibold text-white mb-2">Push Notification Debugger</h3>
            <div className="flex flex-col gap-2">

                {/* Channel ID Input */}
                <div className="space-y-1">
                    <label className="text-xs text-gray-400">Channel ID (Verify):</label>
                    <input
                        type="text"
                        value={channelId}
                        onChange={(e) => setChannelId(e.target.value)}
                        placeholder="Enter Channel ID"
                        className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-xs text-white break-all font-mono"
                    />
                </div>

                {/* VAPID Input */}
                <div className="space-y-1">
                    <label className="text-xs text-gray-400">VAPID Key (Optional):</label>
                    <input
                        type="text"
                        value={vapidKey}
                        onChange={(e) => setVapidKey(e.target.value)}
                        placeholder="Paste VAPID Key if needed"
                        className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-xs text-white"
                    />
                </div>

                <div className="text-xs text-gray-400">
                    Status: <span className={status === "success" ? "text-green-400" : status === "error" ? "text-red-400" : "text-yellow-400"}>{status}</span>
                </div>

                <Button
                    onClick={handleManualRegister}
                    disabled={status === "loading" || status === "manual-loading"}
                    size="sm"
                    variant="outline"
                    className="w-full"
                >
                    {status === "manual-loading" ? "Registering with FCM..." : "Register with FCM (Firebase)"}
                </Button>
            </div>
        </div>
    );
}
